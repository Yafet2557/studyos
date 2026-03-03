import { getUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { CourseList } from "@/components/courses/course-list";

export default async function CoursesPage() {
  const userId = await getUser();

  const courses = await prisma.course.findMany({
    where: { userId },
    include: { _count: { select: { assignments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <CourseList courses={courses} />;
}
