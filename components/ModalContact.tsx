"use client"
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import Link from 'next/link';

const ModalContact = ({phone}:{phone:string}) => {

    const [msj,setmsj]=useState<string>("")
    return (
        <Dialog>
                    <DialogTrigger asChild>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100"
                          height="100"
                          viewBox="0 0 24 24"
                          className=' h-8 w-8 fill-primary hover:scale-105 cursor-pointer'
                        >
                          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.232-1.236a10 10 0 0 0 4.774 1.215h.004c5.505 0 9.985-4.48 9.988-9.985a9.92 9.92 0 0 0-2.922-7.066A9.92 9.92 0 0 0 12.012 2m-.002 2a7.95 7.95 0 0 1 5.652 2.342 7.93 7.93 0 0 1 2.336 5.65c-.002 4.404-3.584 7.987-7.99 7.987a8 8 0 0 1-3.817-.971l-.673-.367-.745.175-1.968.465.48-1.785.217-.8-.414-.72a8 8 0 0 1-1.067-3.992C4.023 7.582 7.607 4 12.01 4M8.477 7.375a.92.92 0 0 0-.666.313c-.23.248-.875.852-.875 2.08s.894 2.415 1.02 2.582c.123.166 1.726 2.765 4.263 3.765 2.108.831 2.536.667 2.994.625.458-.04 1.477-.602 1.685-1.185s.209-1.085.147-1.188c-.062-.104-.229-.166-.479-.29-.249-.126-1.476-.728-1.705-.811s-.396-.125-.562.125-.643.81-.79.976c-.145.167-.29.19-.54.065-.25-.126-1.054-.39-2.008-1.24-.742-.662-1.243-1.477-1.389-1.727s-.013-.386.112-.51c.112-.112.248-.291.373-.437.124-.146.167-.25.25-.416s.04-.313-.022-.438-.547-1.357-.77-1.851c-.186-.415-.384-.425-.562-.432-.145-.006-.31-.006-.476-.006"></path>
                        </svg>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Enviar mensaje</DialogTitle>
                        <DialogDescription>Contactar con: {phone}</DialogDescription>
                      </DialogHeader>
                      <form className="grid gap-4 py-4">
                        
                        <div className="items-start gap-4 flex flex-col gap-2">
                          <Label htmlFor="username" className="text-right">
                            Mensaje
                          </Label>
                          <Textarea id="username" name='msj' onChange={(e)=>{
                            setmsj(e.target.value)
                          }} className="col-span-3" />
                        </div>
                      </form>
                      <DialogFooter>
                        <Link 
                          href={`https://api.whatsapp.com/send?phone=58${phone}&text=${msj}`} 
                          target={"_blank"} 
                          type="submit" 
                          className='text-white font-bold bg-green-400 rounded-lg w-fit h-fit p-2 gap-2 flex flex-row'>
                          
                          Enviar mensaje
                          <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100"
                          height="100"
                          viewBox="0 0 24 24"
                          className=' h-6 w-6 fill-white'
                        >
                          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.232-1.236a10 10 0 0 0 4.774 1.215h.004c5.505 0 9.985-4.48 9.988-9.985a9.92 9.92 0 0 0-2.922-7.066A9.92 9.92 0 0 0 12.012 2m-.002 2a7.95 7.95 0 0 1 5.652 2.342 7.93 7.93 0 0 1 2.336 5.65c-.002 4.404-3.584 7.987-7.99 7.987a8 8 0 0 1-3.817-.971l-.673-.367-.745.175-1.968.465.48-1.785.217-.8-.414-.72a8 8 0 0 1-1.067-3.992C4.023 7.582 7.607 4 12.01 4M8.477 7.375a.92.92 0 0 0-.666.313c-.23.248-.875.852-.875 2.08s.894 2.415 1.02 2.582c.123.166 1.726 2.765 4.263 3.765 2.108.831 2.536.667 2.994.625.458-.04 1.477-.602 1.685-1.185s.209-1.085.147-1.188c-.062-.104-.229-.166-.479-.29-.249-.126-1.476-.728-1.705-.811s-.396-.125-.562.125-.643.81-.79.976c-.145.167-.29.19-.54.065-.25-.126-1.054-.39-2.008-1.24-.742-.662-1.243-1.477-1.389-1.727s-.013-.386.112-.51c.112-.112.248-.291.373-.437.124-.146.167-.25.25-.416s.04-.313-.022-.438-.547-1.357-.77-1.851c-.186-.415-.384-.425-.562-.432-.145-.006-.31-.006-.476-.006"></path>
                        </svg>
                        </Link>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
    );
}

export default ModalContact;
