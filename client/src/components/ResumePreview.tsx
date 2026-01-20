import React, { forwardRef } from 'react';
import type { InsertResume } from '@shared/schema';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ResumePreviewProps {
  data: InsertResume;
  className?: string;
}

// Helper to format dates safely
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM yyyy');
  } catch (e) {
    return dateStr;
  }
};

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, className }, ref) => {
    // Fallback data for empty states to maintain layout in preview
    const {
      personalInfo = { fullName: '', email: '', phone: '', location: '', summary: '' },
      experience = [],
      education = [],
      skills = []
    } = data;

    return (
      <div 
        ref={ref}
        className={cn(
          "w-full bg-white text-slate-800 p-12 min-h-[1122px] mx-auto print-container",
          className
        )}
        style={{ width: '210mm', minHeight: '297mm' }} // A4 dimensions
      >
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-6 mb-8">
          <h1 className="text-4xl font-serif font-bold tracking-wide text-slate-900 mb-2 uppercase">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
            {personalInfo.email && (
              <span>{personalInfo.email}</span>
            )}
            {personalInfo.phone && (
              <span>• {personalInfo.phone}</span>
            )}
            {personalInfo.location && (
              <span>• {personalInfo.location}</span>
            )}
          </div>
        </header>

        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">
              Professional Summary
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-1">
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-bold text-slate-800">
                      {exp.position || 'Position'}
                    </h3>
                    <span className="text-sm font-medium text-slate-500 shrink-0">
                      {formatDate(exp.startDate)} – {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-slate-700 mb-2">
                    {exp.company || 'Company Name'}
                  </div>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-1">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-bold text-slate-800">
                      {edu.institution || 'University'}
                    </h3>
                    <span className="text-sm font-medium text-slate-500 shrink-0">
                      {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                    </span>
                  </div>
                  <div className="text-base text-slate-700">
                    {edu.degree}
                  </div>
                  {edu.description && (
                    <p className="text-sm text-slate-600 mt-1">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
