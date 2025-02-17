import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import connectDB from "@/utils/db";
import { User } from "@/models/user1"


export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					points: 0,
				};
			},
			authorization: {
				params: {
					prompt: "select_account",
					access_type: "offline",
					response_type: "code"
				}
			}

		}),

		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			credentials: {
				email: { label: "Username", type: "text", placeholder: "email or username" },
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

					if (!isCorrect) {
						throw new Error("Invalid password");
					}

					return {
						id: user._id.toString(),
						email: user.email,
						name: user.name,
					};

				} catch (err: any) {

					throw new Error(err);

				}

			}
		})
	],
	adapter: MongoDBAdapter(clientPromise),
	callbacks: {
		async signIn({ user, account, profile }) {
			console.log("user: " + user);
			if (account?.provider === "google") {
				try {
					await connectDB(); // Ensure DB connection
					console.log("Google Sign-In Triggered");

					// Log received user data
					console.log("Received Profile:", profile);
					console.log("Received User:", user);

					// Check if user already exists
					const existingUser = await User.findOne({ email: profile?.email });
					console.log("Existing User:", existingUser);

					if (!existingUser) {
						// Since Google OAuth doesn't provide a password, we need to handle this properly
						const newUser = await User.create({
							name: user.name,
							email: user.email,
							password: "oauth_google", // Placeholder password
							points: 0,
						});

						console.log("New User Created:", newUser);
					}

					return true;
				} catch (error) {
					console.error("Error in signIn callback:", error);
					return false;
				}
			}

			return true; // Allow other providers to handle their sign-in
		},

		async jwt({ token, user }) {
			console.log("JWT Callback - Token:", token);
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
			}
			return token;
		},

		async session({ session, token }) {
			console.log("Session Callback - Token:", token);
			if (session.user) {
				// Only include essential data in the session
				session.user.id = token.id;
				session.user.name = token.name as string;
				session.user.email = token.email as string;
			}
			return session;
		},
	},
	pages: {
		signIn: '/login',
		signOut: '/auth/signout',
		error: '/auth/error', // Error code passed in query string as ?error=
		verifyRequest: '/otp', // (used for check email message)
		newUser: 'auth/register' // New users will be directed here on first sign in (leave the property out if not of interest)
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60
	},
	secret: process.env.NEXTAUTH_SECRET,

}

