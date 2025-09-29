import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/slug";
import { prisma } from "@/lib/prisma";

type Body = {
    url?: string;
    customSlug?: string;
    title?: string;
}

function validateUrl(url?: string) {
    if (!url) return false;
    try {
        const parsed = new URL(url)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch (error) {
        return false
    }
}

export async function POST(req: Request) {
    try {
        const body: Body = await req?.json()

        if (!validateUrl(body?.url)) {
            return NextResponse.json({
                status: false,
                error: "Invalid url"
            }, { status: 400 })
        }

        let slug = body?.customSlug?.trim()

        if (slug) {
            if (!/^[0-9A-Za-z_-]{3,64}$/.test(slug)) {
                return NextResponse.json({
                    status: false,
                    error: "Invalid custom slug"
                }, { status: 400 })
            }

            const exists = await prisma.Url.findUnique({ where: { slug } })

            if (exists) {
                return NextResponse.json({
                    status: false,
                    error: "slug already exists"
                }, { status: 409 })
            }
        } else {
            let tries = 0
            do {
                slug = generateSlug(6 + Math.floor(tries / 10))
                const exists = await prisma.Url.findUnique({ where: { slug } })
                if (!exists) break
                tries++
            } while (tries < 10) {
                if (!slug) {
                    return NextResponse.json({
                        status: false,
                        error: "unable to generate slug"
                    }, { status: 500 })
                }
            }
        }

        const created = await prisma.Url.create({
            data: {
                slug,
                originalUrl: body?.url!,
                title: body?.title ?? null
            }
        })

        const base = process.env.NEXT_PUBLIC_BASE_URL ?? `${process.env.NEXT_PUBLIC_VERCEL_URL}` ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` :""
        const short = base ? `${base.replace(/\/$/, "")}/{created.slug}`: `/$created.slug}`;
                return NextResponse.json({
                    status: true,
                    message: "Slug created successfully",
                    data: {id: created.id,slug: created.slug, shortUrl: short, originalUrl: created.originalUrl}
                })
    } catch (error) {
        console.log("Shorten error", error);
                return NextResponse.json({
                    status: false,
                    error: "Server error"
                }, { status: 500 })
    }
}