"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import jwt from 'jsonwebtoken';

const getprice=async ()=>{

  const getTasa= await fetch("https://ve.dolarapi.com/v1/dolares/paralelo",{method:"GET"})
  const resTasa= await getTasa?.json()
  const supabase = await createClient();
  let { data: settings, error } = await supabase
  .from('settings')
  .select("*")
  if(!settings) return null;
  return {price: settings[0].price, tasa:resTasa.promedio+1,monto:2 }
      
}

const getNumbers= async (number:number)=>{
  "use server"
 
  const data= await fetch(`${process.env.URL}/api/numbers?count=${encodeURIComponent(number)}`,{method:"GET"})
  const datares= await data.json()
  const numbers= datares?.numbers.map((item:any)=>`${item.number}` )

  return numbers
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const cedula = formData.get("cedula")?.toString();
  const phone = formData.get("phone")?.toString();
  const img = formData.get("img")?.toString();
  const monto = formData.get("monto")?.toString();
  const method = formData.get("method")?.toString();
  const number = formData.get("number")?.toString();
  const nt = formData.get("nt")?.toString();

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { data,error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  const numbersRifa= await getNumbers(Number(number))

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    
      const {  error } = await supabase
      .from('profile')
      .insert([
        { user_id:data.user?.id,rol:"user",name,phone,ntickets:numbersRifa, address:"",cedula:cedula },
      ])
      .select()

      const { data:payment, error:errorpayments } = await supabase
      .from('payments')
      .insert([
        { user: data.user?.id, numbers:numbersRifa, capture:img, trans_number:nt, pay_method:method,status:false,monto:monto },
      ])
      .select()

      if (error ) {
        console.error(error.code + " " + error.message);
        return encodedRedirect("error", "/sign-up", error.message);
      }
      if(errorpayments ){
        return encodedRedirect("error", "/sign-up", errorpayments.message);
      }
      if (payment){
        for (let index = 0; index < payment[0].numbers.length; index++) {
          const element = payment[0].numbers[index];
          const { data:tickets, error } = await supabase
          .from('tickets')
          .update({ "status": 'no disponible' })
          .eq('number', element)
          .select()
          if(error)return redirect(`/protected/dashboard/admin/pagos/verify/id?error=${encodeURIComponent("error del servidor intente de nuevo")}`) 
          
        }
        return redirect(`/protected/dashboard/users/?buy=${encodeURIComponent("Compra Exitosa!")}`)
  
      } 

      const { error:errorsignin } = await supabase.auth.signInWithPassword({
          email,
          password,
      });
    return redirect("/protected/dashboard/users?user=nuevo");
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected/dashboard/users");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};


export const validarPago= async (formData:FormData) => {
  const supabase = await createClient();
  const id= formData.get("id")

  const { data, error } = await supabase
  .from('payments')
  .update({ status: true })
  .eq('id', id)
  .select()

  if(!data){
    return  redirect(`/protected/dashboard/admin/pagos/verify/${id}?error=${encodeURIComponent("error del servidor intente de nuevo")}`) 
  
  }
  for (let index = 0; index < data[0].numbers.length; index++) {
    const element = data[0].numbers[index];
    const { data:tickets, error } = await supabase
    .from('tickets')
    .update({ "status": 'comprado' })
    .eq('number', element)
    .select()
    if(error)return redirect(`/protected/dashboard/admin/pagos/verify/${id}?error=${encodeURIComponent("error del servidor intente de nuevo")}`) 
    
  }
  
  return  redirect(`/protected/dashboard/admin/pagos/?message=${encodeURIComponent("Pago validado exitosamente!")}`) 
  

};

export const CancelarPago= async (formData:FormData) => {
  const supabase = await createClient();
  const id= formData.get("id")

  const { data, error } = await supabase
  .from('payments')
  .update({ status: true })
  .eq('id', id)
  .select()




  if(!data){
    return  redirect(`/protected/dashboard/admin/pagos/verify/${id}?error=${encodeURIComponent("error del servidor intente de nuevo")}`) 
  
  }

  
  let { data: profile, error:errorprofile } = await supabase
  .from('profile')
  .select('*')
  .eq("user_id", data[0].user )

  if(!profile){
    return  redirect(`/protected/dashboard/admin/pagos/verify/${id}?error=${encodeURIComponent("error del servidor intente de nuevo")}`) 
  
  }
  for (let index = 0; index < data[0]?.numbers?.length; index++) {
    const element = data[0]?.numbers[index];
    const { data:tickets, error } = await supabase
    .from('tickets')
    .update({ "status": 'disponible' ,payid:null})
    .eq('number', element)
    .select()

    const {  error:errorupdate } = await supabase
      .from('profile')
      .update({ ntickets:profile[0]?.ntickets?.filter((e:any)=>e==element).length<4?[]:profile[0].ntickets.filter((e:any)=>e==element)})
      .eq('user_id',  data[0].user )
      .select();

    if(error|| errorupdate )return redirect(`/protected/dashboard/admin/pagos/verify/${id}?error=${encodeURIComponent("error al cambiar estado de tickets, intente de nuevo")}`) 
    
  }

  
  const { error:paymentDeleteErr } = await supabase
  .from('payments')
  .delete()
  .eq('id', id)

  if(paymentDeleteErr){
    for (let index = 0; index < data[0]?.numbers?.length; index++) {
      const element = data[0]?.numbers[index];
      const { data:tickets, error } = await supabase
      .from('tickets')
      .update({ "status": 'no disponible',payid:data[0]?.id })
      .eq('number', element)
      .select()

      const {  error:errorupdate } = await supabase
      .from('profile')
      .update({ ntickets:profile[0].ntickets.filter((e:any)=>e==element)})
      .eq('id',  data[0]?.user )
      .select();
      if(error|| errorupdate)return redirect(`/protected/dashboard/admin/pagos/verify/${id}?error=${encodeURIComponent("error al cambiar estado de tickets, intente de nuevo")}`) 
      
    }
    redirect(`/protected/dashboard/admin/pagos/verify/${id}?error=${encodeURIComponent("error al intentar eliminar el pago, intente de nuevo")}`) 

  }
        
  
  return  redirect(`/protected/dashboard/admin/pagos/?message=${encodeURIComponent("Pago eliminado exitosamente!")}`) 
  

};


export const arr=async()=>{
  interface Profile {
  user_id: string;
  ntickets: number[]; // Ajusta según tu estructura real
  // Otros campos...
}
  const supabase = await createClient();
  let offset = 0;
  const pageSize = 1000; // Tamaño máximo permitido por Supabase
  let hasMore = true;
  const processBatch = async (payments:any) => {
  if (payments.length === 0) return;

  // Obtener todos los user_id del lote actual
  const userIds:string[] = [...new Set<string>(payments.map((p:{id:string,created_at:string,user:string,numbers:string,capture:string,trans_number:string,pay_method:string,status:string,monto:number}) => p.user))];
  console.log(userIds)

      // Obtener todos los perfiles en una sola consulta
      const profiles=await Promise.all(
         userIds.map(async (data:string) => {
           const { data: profile, error } = await supabase
            .from('profile')
            .select('user_id, ntickets')
            .eq("user_id",data)
            if (profile==null) return null;
            return profile[0]
        })
      );

      if (!profiles ||( profiles&& profiles.length < 1)) {
        console.error('Error al obtener perfiles:');
        return;
      }

      // Mapear perfiles por user_id para acceso rápido
      const profileMap = profiles.reduce<Record<string, Profile>>((acc, profile) => {
        if (profile==null) return acc;
        acc[profile.user_id] = profile; // Ahora TypeScript sabe que acc es un mapa de string -> Profile
        return acc;
      }, {}); 

      // Actualizar perfiles en paralelo (sin bloquear el bucle)
      await Promise.all(
        payments.map(async (data:{id:string,created_at:string,user:string,numbers:string,capture:string,trans_number:string,pay_method:string,status:string,monto:number}) => {
          const profile = profileMap[data.user];
          if (!profile) return;

          // Actualizar ntickets
          const updatedTickets = [...new Set([...data.numbers, ...profile.ntickets])];
          
          const { error: updateError } = await supabase
            .from('profile')
            .update({ ntickets: updatedTickets })
            .eq('user_id', data.user);

          if (updateError) {
            console.error(`Error actualizando perfil ${data.user}:`, updateError);
          }
        })
      );
    };

  while (hasMore) {
    // Obtener un lote de registros
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq("status",true)
      .range(offset, offset + pageSize - 1); // Rango [offset, offset+999]

    if (error) {
      console.error('Error al obtener pagos:', error);
      break;
    }

    // Verificar si hay más registros
    if (payments.length < pageSize) hasMore = false;

    // Procesar el lote actual (ver sección de optimización)
    await processBatch(payments);

    offset += pageSize;
  }

  redirect(`/protected/dashboard/admin/top?updated=${Math.round(Math.random() * 100000)}`);
}


export const agregarticketErr=async ()=>{
  const supabase = await createClient();

      
const { data:payment, error:err } = await supabase
  .from('payments')
  .select("numbers")
  .eq('user', "7fa77adb-1da5-4863-9a80-280bc4a03623")
 
  if(!payment)return console.log("err")
  const total=payment.map((item)=>{
  return item.numbers
  })
  console.log(total)

  const { data:profileupdate, error:er } = await supabase
  .from('profile')
  .update({ "ntickets": total.flat() })
  .eq('user_id', '7fa77adb-1da5-4863-9a80-280bc4a03623')
  .select()
          
   console.log("err",er)


}
