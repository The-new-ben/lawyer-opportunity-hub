import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormWithAI } from '@/aiIntake/useFormWithAI';
import AIChat from '@/components/AIChat';
import { Scale, Globe, FileText, Users } from 'lucide-react';

export default function GlobalCourt() {
  const formCtl = useFormWithAI('global-court');

  const { form } = formCtl;
  const watchedValues = form.watch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Global AI Court</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered legal assistance for international cases
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* צ'אט AI */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                AI Legal Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              <AIChat formCtl={formCtl} />
            </CardContent>
          </Card>

          {/* שדות הטופס */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Case Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto h-[500px]">
              <div>
                <label className="text-sm font-medium mb-2 block">Case Title</label>
                <Input
                  {...form.register('title')}
                  placeholder="Enter case title..."
                  className="transition-all duration-200"
                />
                {watchedValues.title && (
                  <p className="text-xs text-green-600 mt-1">✓ Populated by AI</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Case Summary</label>
                <textarea
                  {...form.register('summary')}
                  placeholder="Detailed case summary..."
                  className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-foreground"
                />
                {watchedValues.summary && (
                  <p className="text-xs text-green-600 mt-1">✓ Populated by AI</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Jurisdiction</label>
                <Input
                  {...form.register('jurisdiction')}
                  placeholder="Legal jurisdiction..."
                />
                {watchedValues.jurisdiction && (
                  <p className="text-xs text-green-600 mt-1">✓ Populated by AI</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Legal Category</label>
                <Input
                  {...form.register('category')}
                  placeholder="Type of legal case..."
                />
                {watchedValues.category && (
                  <p className="text-xs text-green-600 mt-1">✓ Populated by AI</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Relief Sought</label>
                <Input
                  {...form.register('goal')}
                  placeholder="What outcome do you seek..."
                />
                {watchedValues.goal && (
                  <p className="text-xs text-green-600 mt-1">✓ Populated by AI</p>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full"
                  disabled={!watchedValues.title || !watchedValues.summary}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Proceed to Court Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}