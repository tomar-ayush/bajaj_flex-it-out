import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { User } from "@/models/user";
import connectDB from "@/utils/db";
import { IUserLean } from "@/types/user";

export const authOptions: NextAuthOptions = {
	providers: [

		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Username", type: "text", placeholder: "jsmith" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials: any): Promise<any> {
				/*
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please enter your email and password");
				}
				*/
				await connectDB();
				try {
					// Find user
					const user = await User.findOne({
						$or: [
							{ email: credentials.identifier },
							{ username: credentials.identifier }
						]
					}).lean() as IUserLean | null;

					if (!user || !user.password) {
						throw new Error("No user found with this email");
					}

					// Verify password
					const isValid = await bcrypt.compare(
						credentials.password,
						user.password
					);

					if (!isValid) {
						throw new Error("Invalid password");
					}

					// Return user object
					return {
						id: user._id.toString(),
						email: user.email,
						name: user.name,
						points: user.points
					};
				} catch (error) {
					console.error("Auth error:", error);
					throw new Error(error instanceof Error ? error.message : "Authentication failed");
				}
			}
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	adapter: MongoDBAdapter(clientPromise),
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
				token.points = user.points;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
				(session.user as any).points = token.points;
			}
			return session;
		}
	},
	pages: {
		signIn: '/login',
		error: '/auth/error',
	},
	debug: process.env.NODE_ENV === 'development',
	secret: process.env.NEXTAUTH_SECRET,
};
