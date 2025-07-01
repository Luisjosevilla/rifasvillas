
import UserBuyTicketsForm from '@/components/buyForms/UserBuyTicketForm';
import { createClient } from '@/utils/supabase/server';
import React from 'react'
export const dynamic = 'force-dynamic';
async function Page(props: {
  searchParams: Promise<any>;
}) {
  const searchParams= await props.searchParams

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

   const getprice=async ()=>{
    try{
      const getTasa= await fetch("https://ve.dolarapi.com/v1/dolares/paralelo",{method:"GET"})
      const resTasa= await getTasa?.json()
      const supabase = await createClient();
      let { data: settings, error } = await supabase
      .from('settings')
      .select("*")
      if(!settings) return null;
      return {price: settings[0].price, tasa:settings[0].d_paralelo?resTasa.promedio:settings[0].dolar,monto:settings[0].ntickets }
          
    }catch(err){
      return {price: "", tasa:"",monto:""}
    }
   
        
  }

  let { data: methods, error:errormethod } = await supabase
  .from('method')
  .select('*')

  let { data: profile, error } = await supabase
  .from('profile')
  .select("*")
  .eq('user_id', user?.id)

  return (
    <section className='flex flex-row gap-4 '>
       <span>no se puede comprar</span>
    </section>
  )
}

export default Page