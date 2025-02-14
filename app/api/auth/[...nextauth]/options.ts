import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/utils/db";
import { User } from "@/models/user"


export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),

		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			credentials: {
				email: { label: "Username", type: "text", placeholder: "jsmith" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials: any): Promise<any> {

				await connectDB();

				try {

					const user = await User.findOne({
						$or: [
							{ email: credentials.identifier },
							{ username: credentials.identifier }
						]
					})

					if (!user) {
						throw new Error("No user ")
					}

					const isCorrect = await bcrypt.compare(credentials.password, user.password);

					if (isCorrect) {
						return user;
					} else {

						throw new Error("Incorrect Password")
					}

				} catch (err: any) {

					throw new Error(err);

				}

			}
		})
	],
	callbacks: {
		async session({ session, token }) {
			// Optionally attach additional properties from token
			if (token) {
				session.user = { ...session.user, id: token.id };
			}
			return session;
		},
		async jwt({ token, user }) {
			// On first sign in, add user id to token
			if (user) {
				token.id = user._id;
			}
			return token;
		},
	},
	pages: {
		signIn: '/login',
		signOut: '/auth/signout',
		error: '/auth/error', // Error code passed in query string as ?error=
		verifyRequest: '/otp', // (used for check email message)
		newUser: '/register' // New users will be directed here on first sign in (leave the property out if not of interest)
	},
	session: {
		strategy: "jwt"
	},
	secret: process.env.NEXTAUTH_SECRET,

}

