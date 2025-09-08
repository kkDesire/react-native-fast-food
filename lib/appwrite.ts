import type { CreateUserParams, GetMenuParams, SignInParams } from "@/type"
import { Account, Avatars, Client, Databases, ID, Query, Storage, TablesDB } from "react-native-appwrite"

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    platform: process.env.EXPO_PUBLIC_PLATFORM!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    projectName: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!,
    userCollectionId: 'user',
    categoriesCollectionId: 'categories',
    menuCollectionId: 'menu',
    customizationsCollectionId: 'customizations',
    menuCustomizationsCollectionId: 'menu_customizations',
}

export const client = new Client()
client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account: Account = new Account(client)
export const databases = new Databases(client);
export const tables = new TablesDB(client)
export const avatars = new Avatars(client)
export const storage = new Storage(client);

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
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userCollectionId,
            rowId: newAccount.$id,
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

export const SignOut = async () => {
    try {
        const currentAccount = await account.get()
        console.log('Current account:', JSON.stringify(currentAccount, null, 2))
        const result = await account.deleteSession({
            sessionId: currentAccount.$id
        })

        console.log('Sign out successful:', result)
    } catch (error) {
        throw new Error(error as string)
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()
        if(!currentAccount) throw Error;
        const currentUser = await tables.getRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userCollectionId,
            rowId: currentAccount.$id,
        })
        if (!currentUser) throw Error;
        return currentUser;
    } catch (error) {
        throw new Error(error as string)
    }
}

export const getMenus = async ({category, query}: GetMenuParams) => {
    try {
        const queries: string[] = [];
        if(category) queries.push(Query.equal("categories", category));
        if(query) queries.push(Query.search("name", query));
        const menus = await tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.menuCollectionId,
            queries
        })

        return menus.rows
    } catch (error) {
        throw new Error(error as string)
    }
}

export const geCategories = async () => {
    try{
        const categories = await tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.categoriesCollectionId,
        })
        return categories.rows
    }catch (error) {
        throw new Error(error as string)
    }
}