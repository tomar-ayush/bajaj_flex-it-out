"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

type FormValues = {
  email: string
  currentPassword: string
  newPassword: string
  name: string
}

export default function UpdateProfileForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      email: "user@example.com", // This would typically come from your auth state
      currentPassword: "",
      newPassword: "",
      name: "",
    },
  })

  function onSubmit(values: FormValues) {
    setIsLoading(true)
    // Here you would typically send the form data to your backend
    console.log(values)
    setTimeout(() => {
      setIsLoading(false)
      // Reset form or show success message
    }, 2000)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
        <CardDescription>Change your profile information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentPassword"
              rules={{
                required: "Current password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              rules={{
                required: "New password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}