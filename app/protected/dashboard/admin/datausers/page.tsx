
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import React from 'react';

export const dynamic = 'force-dynamic';
const Page = async ({
    params,
    searchParams,
  }: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[]  }>;
  
  }) => {
    const Qparams= await searchParams
    const supabase = await createClient();
    let data=[];
    const buscarDataUsers=async (e:FormData)=>{
        "use server"
        revalidatePath(`/protected/dashboard/admin/datausers?user=${e.get("user")}`)
        redirect(`/protected/dashboard/admin/datausers?user=${e.get("user")}`)
    }
    if(Qparams?.user){  
          
        let { data: profile, error:ErrProfile} = await supabase
        .from('profile')
        .select("*")
        .ilike('name', Qparams?.number?.toString())

        if(!profile||ErrProfile){
            redirect(`/protected/dashboard/admin/datausers?error=${encodeURI("Error perfil no encontrado")}`)
        }  
        console.log(profile)
    return (
        <div className='flex flex-col w-full p-10 gap-6'>
            <div className='flex flex-col md:flex-row justify-between w-full'>
                <h1 className='text-xl md:text-4xl font-bold text-primary'>Buscar datos del usuario</h1>
                <form className='flex  md:flex-row gap-2 ' action={buscarDataUsers}>
                    <Input type='text' name='user' />
                    <SubmitButton pendingText='Consultando...' className='bg-primary p-2 rounded-lg w-fit h-fit'>Buscar</SubmitButton>
                </form>
            </div>
            <div className='w-full h-fit items-center justify-center flex '>
                {profile?.map((data,i)=>{
                    return (<form key={i} className='flex flex-col gap-4 rounded-lg w-fit h-fit p-4 border-2 border-primary/50'>
                        <h4 className='text-xl font-bold text-foreground'>Datos del usuario</h4>
                        <div className='flex flex-col gap-2'>
                            <span className='text-xl font-bold text-primary'>Nombre</span>
                            <Input className='text-lg font-bold text-foreground' value={ data?.name}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span className='text-xl font-bold text-primary'>Número de teléfono</span>
                            <Input className='text-lg font-bold text-foreground' value={ data?.phone}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span className='text-xl font-bold text-primary'>Cédula</span>
                            <Input className='text-lg font-bold text-foreground' value={ data?.cedula}/>
                        </div>
                        <SubmitButton pendingText='Consultando...' type='submit' className='bg-primary p-2 rounded-lg w-fit h-fit'>Editar datos</SubmitButton>

                    </form >)
                })}
                
            </div>
            
        </div>
    );
    }

    return (
        <div className='flex flex-col w-full p-10 gap-6'>
            <div className='flex flex-col md:flex-row justify-between w-full'>
                <h1 className='text-xl md:text-4xl font-bold text-primary'>Buscar Usuario</h1>
                <form className='flex  md:flex-row gap-2 ' action={buscarDataUsers}>
                    <Input type='text' name='user' />
                    <SubmitButton pendingText='Consultando...' className='bg-primary p-2 rounded-lg w-fit h-fit'>Buscar</SubmitButton>
                </form>
            </div>
            <div className='w-full h-fit justify-center '>
               {Qparams?.error?
                <span className='p-2 rounded-lg w-fit h-fit bg-red-300 text-red-700 text-lg font-bold'>{Qparams?.error}</span>
                :null

               } 
                
            </div>
            
        </div>
    );
}

export default Page;
