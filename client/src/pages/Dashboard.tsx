import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plus, FileText, Trash2, Edit, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumes, useCreateResume, useDeleteResume } from "@/hooks/use-resumes";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: resumes, isLoading } = useResumes();
  const createResume = useCreateResume();
  const deleteResume = useDeleteResume();
  const [, setLocation] = useLocation();

  const handleCreate = async () => {
    try {
      const newResume = await createResume.mutateAsync({
        title: "Untitled Resume",
        personalInfo: { fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '', email: user?.email || '', phone: '', location: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        isPublished: false
      });
      setLocation(`/editor/${newResume.id}`);
    } catch (error) {
      console.error("Failed to create resume", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-serif">
              R
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              Welcome, {user?.firstName}
            </span>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-slate-900">My Resumes</h1>
            <p className="text-muted-foreground mt-1">Manage and edit your professional documents</p>
          </div>
          <Button onClick={handleCreate} disabled={createResume.isPending} className="shadow-md shadow-primary/20">
            {createResume.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Create New Resume
          </Button>
        </div>

        {resumes && resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-xl border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                    {resume.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last updated {format(new Date(resume.updatedAt || new Date()), "MMM d, yyyy")}
                  </p>
                </div>
                
                <div className="border-t bg-slate-50 p-4 flex items-center justify-between">
                  <Link href={`/editor/${resume.id}`}>
                    <Button variant="outline" size="sm" className="bg-white hover:bg-slate-100">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the resume "{resume.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteResume.mutate(resume.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Get started by creating your first professional resume today.
            </p>
            <Button onClick={handleCreate} disabled={createResume.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Resume
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
