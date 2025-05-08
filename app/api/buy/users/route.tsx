import { NextApiResponse } from 'next'
import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { createClient } from '../../../../utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';
import jwt from 'jsonwebtoken';

export async function POST( request:NextRequest) {

try {
    const supabase = await createClient();
const formData = await request.formData();

const getNumbers= async (number:number,name:string)=>{
    const data= await fetch(`${process.env.URL}/api/numbers?count=${encodeURIComponent(number)}&name=${encodeURIComponent(name)}`,{method:"GET"})
    const datares= await data.json()
    
    const numbers= datares?.numbers.map((item:any)=>`${item.number}` )
  
    return numbers
}
let { data: settings, error } = await supabase
.from('settings')
.select("*")
if(!settings) return NextResponse.json({msj:"Error servidor"},{status:500});


if(!(Number(formData.get("number"))>=settings[0].ntickets)){
      return NextResponse.json({msj:`Error número de tickets menor que ${settings[0].ntickets}`},{status:500})
    }
    if(!formData.get("transfer")){
      return NextResponse.json({msj:"Error numero de transferencia"},{status:500})
    }
    if(!formData.get("file")){
     return NextResponse.json({msj:"Error archivos"},{status:500})
    }
    if(!formData.get("terms")){
      return NextResponse.json({msj:"Error Aceptar terminos"},{status:500})
    }
   
    const url = 'https://upload.imagekit.io/api/v2/files/upload';
    const form = new FormData();
    form.append('file', formData.get("file")!);
    const filename= `capture${Math.round(Math.random()*1000000)}.jpg`;
  
  
    const token = jwt.sign({
      fileName: filename
    }, process.env.PRIVATE_KEY!, {
      expiresIn: 600,
      header: {
        alg: "HS256",
        typ: "JWT",
        kid: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
      },
    });
    form.append("fileName", filename);
    form.append('token', token);
    const options = {
      body:form,
      method: 'POST',
      headers: {Accept: 'application/json', Authorization: `Bearer ${process.env.PRIVATE_KEY}`}
    };
  
     
      const response = await fetch(url, options);
      const data = await response.json();
      if (!data) return NextResponse.json({msj:"Error servidor"},{status:500});
    let { data: profile, error:errorprofile } = await supabase
    .from('profile')
    .select('*')
    .eq("user_id", formData.get("user") )
            
    const numbersRifa= await getNumbers(Number( formData.get("number") ), formData.get("name")!.toString() )

      if(!profile){
        return  NextResponse.json({msj:"ha ocurrido un error al obtener perfil"},{status:500})
      }
      
      const {  error:errorupdate } = await supabase
      .from('profile')
      .update({ ntickets:[...new Set([...profile[0].ntickets, ...numbersRifa])]})
      .eq('id',  profile[0].id )
      .select();
    
        

      const { data:payment, error:errorpayments } = await supabase
      .from('payments')
      .insert([
        { user:  formData.get("user") , numbers:numbersRifa, capture:data?.url, trans_number: formData.get("transfer") , pay_method: formData.get("method") ,status:false,monto: formData.get("monto")  },
      ])
      .select();

    if (payment){
      for (let index = 0; index < payment[0]?.numbers.length; index++) {
        const element = payment[0]?.numbers[index];
        const { data:tickets, error } = await supabase
        .from('tickets')
        .update({ "status": 'no disponible' })
        .eq('number', element)
        .select();
        
        const { data:ticketsIdpay, error:te } = await supabase
        .from('tickets')
        .update({ "payid":payment[0]?.id })
        .eq('number', element)
        .select();

        if(error){
            return NextResponse.json({msj:"ha ocurrido un error al guardar los tickets"},{status:500})
        }
      }
      return NextResponse.json({msj:"Pago registrado, Espere por validación"},{status:200})
    }

} catch (error) {
    return NextResponse.json({msj:"Error servidor"},{status:500});
}
}
 