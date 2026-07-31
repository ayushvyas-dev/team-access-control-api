import { getUserById } from "../repositories/auth.repository.js";


export async function getCurrentUser(userId:string) {
    try{
        const user = await getUserById(userId)
        if (!user) {
        throw new Error("User not found");
      }
  return user
    }catch(error){
        throw error
    }
    
}