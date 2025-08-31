import type { CreateUserParams, SignInParams } from "@/type"
import { Account, Avatars, Client, ID, TablesDB } from "react-native-appwrite"

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    platform: 'com.jsm.kkfoodordering',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    projectName: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
}

export const client = new Client()
client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account: Account = new Account(client)
export const tables = new TablesDB(client)
export const avatars = new Avatars(client)

export const createUser = async ({
    name,
    email,
    password
}: CreateUserParams) => {
    try {
        const newAccount = await account.create({ userId: ID.unique(), email, password, name })
        if (!newAccount) throw Error;
        await SignIn({ email, password })

        const avatarUrl = avatars.getInitialsURL(name)
        return await tables.createRow({
            databaseId: appwriteConfig.databaseId!,
            tableId: appwriteConfig.userCollectionId!,
            rowId: ID.unique(),
            data: {
                email, name, accountId: newAccount.$id, avatar: avatarUrl
            }
        })

    } catch (error) {
        throw new Error(error as string)
    }
}

export const SignIn = async ({
    email,
    password
}: SignInParams) => {
    try {
        return await account.createEmailPasswordSession({ email, password })
    } catch (error) {
        throw new Error(error as string)
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()
        if(!currentAccount) throw Error;
        const currentUser = await tables.getRow({
            databaseId: appwriteConfig.databaseId!,
            tableId: appwriteConfig.userCollectionId!,
            rowId: currentAccount.$id,
            // queries: [Query.equal('accountId', currentAccount.$id)]
        })
        if (!currentUser) throw Error;
        return currentUser;
    } catch (error) {
        throw new Error(error as string)
    }
}