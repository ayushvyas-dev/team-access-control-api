import slugify from "slugify";
import crypto from 'node:crypto'

export function generateSlug(name:string): string{
   const baseSlug = slugify(name, {
    lower:true,
    strict:true,
    trim:true
   })

   const suffix = crypto.randomBytes(3).toString('hex');
   return `${baseSlug}-${suffix}`;
}