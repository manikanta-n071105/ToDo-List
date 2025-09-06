import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs"
import { error } from "console";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    try{
        const body = await request.json();
        const {email,password}=body;

        if(!email||!password){
            return NextResponse.json({error:"Fill the both Fields"},{status:400})
        }

        const existing = await prisma.user.findUnique({
            where:{email}
        })

        if(existing){
            return NextResponse.json({error:"Email aldready exists"},{status:400})
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data:{
                email,
                password:hashedPassword
            }
        })

        return NextResponse.json({message:"User created Successfully"},{status:201})
    }catch(error){
        return NextResponse.json({error:"Internal Server Error"},{status:500})
    }
}