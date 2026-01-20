import { useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertResumeSchema, type InsertResume } from "@shared/schema";
import { useResume, useUpdateResume } from "@/hooks/use-resumes";
import { ResumePreview } from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Save, Loader2, Printer, Plus, Trash2, GripVertical } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Custom type for form handling since form values might be partially empty during editing
type FormValues = InsertResume;

export default function Editor() {
  const [, params] = useRoute("/editor/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: resume, isLoading } = useResume(id);
  const updateResume = useUpdateResume();
  const previewRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(insertResumeSchema),
    defaultValues: {
      title: "Untitled Resume",
      personalInfo: { fullName: "", email: "", phone: "", location: "", summary: "" },
      experience: [],
      education: [],
      skills: [],
      isPublished: false,
    },
  });

  // Watch form values for live preview
  const formValues = form.watch();

  // Load resume data into form
  useEffect(() => {
    if (resume) {
      form.reset({
        title: resume.title,
        personalInfo: resume.personalInfo,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        isPublished: resume.isPublished || false,
      });
    }
  }, [resume, form]);

  // Handle printing
  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: formValues.title || "Resume",
  });

  // Field Arrays for dynamic lists
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    // @ts-ignore - simple array of strings needs specific handling in rhf
    name: "skills" as any, 
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await updateResume.mutateAsync({ id, data });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Simple skills input handling
  const [newSkill, setNewSkill] = useRef<HTMLInputElement | null>(null) as any; // Using ref to avoid re-renders
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val) {
        // We manually update the array in the form data
        const currentSkills = form.getValues('skills') || [];
        form.setValue('skills', [...currentSkills, val]);
        e.currentTarget.value = '';
      }
    }
  };
  
  const removeSkillItem = (index: number) => {
    const currentSkills = form.getValues('skills') || [];
    form.setValue('skills', currentSkills.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Resume not found</h1>
        <Button onClick={() => setLocation('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Toolbar */}
      <header className="bg-white border-b h-16 px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')}>
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <Input 
            {...form.register("title")} 
            className="border-none shadow-none text-lg font-semibold focus-visible:ring-0 px-2 h-auto w-[300px]"
            placeholder="Resume Name"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handlePrint()} className="gap-2">
            <Printer className="w-4 h-4" />
            Export PDF
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={updateResume.isPending} className="gap-2">
            {updateResume.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Resume
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="w-full lg:w-1/2 overflow-y-auto custom-scrollbar border-r bg-white p-6 lg:p-10 pb-20">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-serif mb-2 text-slate-900">Editor</h2>
              <p className="text-muted-foreground">Fill in your details below. The preview updates automatically.</p>
            </div>

            <Accordion type="single" collapsible defaultValue="personal" className="w-full space-y-4">
              
              {/* Personal Info */}
              <AccordionItem value="personal" className="border rounded-xl px-4 shadow-sm bg-slate-50/50">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-lg font-semibold text-slate-800">Personal Information</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Full Name</Label>
                      <Input {...form.register("personalInfo.fullName")} placeholder="e.g. Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input {...form.register("personalInfo.email")} placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input {...form.register("personalInfo.phone")} placeholder="+1 234 567 890" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Location</Label>
                      <Input {...form.register("personalInfo.location")} placeholder="New York, NY" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Professional Summary</Label>
                      <Textarea 
                        {...form.register("personalInfo.summary")} 
                        placeholder="Brief overview of your career..." 
                        className="h-32"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Experience */}
              <AccordionItem value="experience" className="border rounded-xl px-4 shadow-sm bg-slate-50/50">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-lg font-semibold text-slate-800">Experience</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6">
                  <div className="space-y-6">
                    {expFields.map((field, index) => (
                      <Card key={field.id} className="relative overflow-hidden border-slate-200">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <CardContent className="pt-6 pl-6">
                          <div className="flex justify-end mb-2">
                            <Button variant="ghost" size="sm" onClick={() => removeExp(index)} className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Position</Label>
                                <Input {...form.register(`experience.${index}.position`)} placeholder="Job Title" />
                              </div>
                              <div className="space-y-2">
                                <Label>Company</Label>
                                <Input {...form.register(`experience.${index}.company`)} placeholder="Company Name" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" {...form.register(`experience.${index}.startDate`)} />
                              </div>
                              <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" {...form.register(`experience.${index}.endDate`)} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea 
                                {...form.register(`experience.${index}.description`)} 
                                placeholder="Describe your responsibilities and achievements..."
                                className="h-24" 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => appendExp({ id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", description: "" })}
                      className="w-full border-dashed"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Experience
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Education */}
              <AccordionItem value="education" className="border rounded-xl px-4 shadow-sm bg-slate-50/50">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-lg font-semibold text-slate-800">Education</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6">
                  <div className="space-y-6">
                    {eduFields.map((field, index) => (
                      <Card key={field.id} className="relative overflow-hidden border-slate-200">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                        <CardContent className="pt-6 pl-6">
                          <div className="flex justify-end mb-2">
                            <Button variant="ghost" size="sm" onClick={() => removeEdu(index)} className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Institution</Label>
                                <Input {...form.register(`education.${index}.institution`)} placeholder="University / School" />
                              </div>
                              <div className="space-y-2">
                                <Label>Degree</Label>
                                <Input {...form.register(`education.${index}.degree`)} placeholder="Degree / Certificate" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" {...form.register(`education.${index}.startDate`)} />
                              </div>
                              <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" {...form.register(`education.${index}.endDate`)} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description (Optional)</Label>
                              <Textarea 
                                {...form.register(`education.${index}.description`)} 
                                placeholder="Any honors or relevant coursework..."
                                className="h-20" 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => appendEdu({ id: crypto.randomUUID(), institution: "", degree: "", startDate: "", endDate: "", description: "" })}
                      className="w-full border-dashed"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Education
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Skills */}
              <AccordionItem value="skills" className="border rounded-xl px-4 shadow-sm bg-slate-50/50">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-lg font-semibold text-slate-800">Skills</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Type a skill and press Enter..." 
                        onKeyDown={handleAddSkill}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(form.watch('skills') || []).map((skill, index) => (
                        <div key={index} className="bg-white border px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
                          {skill}
                          <button 
                            type="button"
                            onClick={() => removeSkillItem(index)}
                            className="text-slate-400 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="hidden lg:block w-1/2 bg-slate-100 p-10 overflow-y-auto custom-scrollbar flex items-start justify-center">
          <div className="resume-paper transform scale-90 origin-top transition-transform duration-300">
            <ResumePreview ref={previewRef} data={formValues} />
          </div>
        </div>
      </div>
    </div>
  );
}
