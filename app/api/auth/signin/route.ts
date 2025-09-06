import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs"
import { error } from "console";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
    const JWT_SECRET = process.env.JWT_SECRET;
    try {
        const body = await request.json();
        const { email, password } = body;
        if (!email || !password) {
            return NextResponse.json({ message: "Email and Passowrd are required", status: 400 })
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            return NextResponse.json({ message: "Invalid Credentials" }, { status: 401 })
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json({ message: "Wrong Credentials" }, { status: 401 })
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
        return NextResponse.json({ message: "Signin Successful",token }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}