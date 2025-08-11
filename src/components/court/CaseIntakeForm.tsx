import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  case_title: z.string().min(1),
  customer_name: z.string().min(1),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().min(1),
  legal_category: z.string().min(1),
  case_description: z.string().min(1),
  id_document: z.any().optional(),
});

export function CaseIntakeForm() {
  const [ocrText, setOcrText] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const { data: lead } = await supabase
      .from("leads")
      .insert({
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        case_description: values.case_description,
        legal_category: values.legal_category,
        status: "new",
      })
      .select()
      .single();

    const { data: caseRecord } = await supabase
      .from("cases")
      .insert({
        title: values.case_title,
        legal_category: values.legal_category,
        notes: values.case_description,
        status: "new",
        priority: "normal",
      })
      .select()
      .single();

    const file = values.id_document?.[0];
    if (file && caseRecord) {
      const path = `ids/${caseRecord.id}/${file.name}`;
      const { data: upload } = await supabase.storage
        .from("court-documents")
        .upload(path, file);
      if (upload) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("court-documents").getPublicUrl(upload.path);
        const { data: fn } = await supabase.functions.invoke(
          "court-document-upload",
          {
            body: { caseId: caseRecord.id, documentUrl: publicUrl, description: "id" },
          }
        );
        if (fn?.ocrText) setOcrText(fn.ocrText);
      }
    }

    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="case_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customer_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customer_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="legal_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legal Category</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="case_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="id_document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Document</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
        {ocrText && (
          <div className="mt-4">
            <div className="font-medium">OCR Result</div>
            <div className="whitespace-pre-wrap text-sm">{ocrText}</div>
          </div>
        )}
      </form>
    </Form>
  );
}

export default CaseIntakeForm;
