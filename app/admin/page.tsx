"use client";

import { supabase } from "@/lib/auth";
import { useEffect, useState } from "react";
import { BookOpen, FileQuestion, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const quizzesCount = await supabase
        .from("quizzes")
        .select("*", { count: "exact" })
        .single();

      const studentsCount = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .single();

      setStats({
        totalQuizzes: quizzesCount.count || 0,
        totalStudents: studentsCount.count || 0,
      });
    } catch (error) {
      console.error("Error in fetchStats:", error);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {stats.totalQuizzes}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total number of quizzes in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-600">
              {stats.totalStudents}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total number of registered students
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Learning Materials</h3>
              <p className="text-gray-500">Manage content</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <FileQuestion className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Quizzes</h3>
              <p className="text-gray-500">Manage quizzes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <MessageSquare className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Chat Support</h3>
              <p className="text-gray-500">Student questions</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold">Students</h3>
              <p className="text-gray-500">View analytics</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
