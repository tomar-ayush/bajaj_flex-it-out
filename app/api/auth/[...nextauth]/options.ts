import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { IUserLean } from "@/types/user";
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from "@/lib/mongodb";
import connectDB from "@/utils/db";
import { User } from "@/models/user";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					access_type: "offline",
					response_type: "code"
				}
			}
		}),
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
					const user = await User.findOne({
						email: credentials.email
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
		})
	],
	adapter: MongoDBAdapter(clientPromise) as Adapter,
	callbacks: {
		async signIn({ user, account, profile }) {
			try {
				await connectDB();

				if (account?.provider === "google") {
					const existingUser = await User.findOne({ email: user.email });

					if (!existingUser) {
						const new_password = await bcrypt.hash(process.env.OAUTH_GOOGLE_PASS as string, 10)
						await User.create({
							name: user.name,
							email: user.email,
							password: new_password,
							points: 0,
							image: user.image
						});
					}
				}
				return true;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				return false;
			}
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.points = (user as any).points;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				(session.user as any).points = token.points;

				// Fetch latest user data
				await connectDB();
				const dbUser = await User.findOne({ email: session.user.email });
				if (dbUser) {
					(session.user as any).points = dbUser.points;
				}
			}
			return session;
		},
	},
	pages: {
		signIn: '/login',
		error: '/auth/error',
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},
	secret: process.env.NEXTAUTH_SECRET,
};
