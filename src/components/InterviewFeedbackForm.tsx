import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  postId: string;
  postSlug: string;
}

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(4000),
});

const InterviewFeedbackForm = ({ postId, postSlug }: Props) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, message });
    if (!parsed.success) {
      toast.error(t("interviewFeedback.invalid"));
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from("interview_feedback").insert({
      post_id: postId,
      post_slug: postSlug,
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error(t("interviewFeedback.error"));
      return;
    }
    setDone(true);
    setName("");
    setEmail("");
    setMessage("");
    toast.success(t("interviewFeedback.success"));
  };

  return (
    <section className="mt-14 pt-10 border-t border-border">
      <h2 className="font-heading text-[clamp(1.35rem,3vw,1.9rem)] font-bold text-primary text-center leading-tight max-w-[820px] mx-auto">
        {t("interviewFeedback.headline")}
      </h2>

      {done ? (
        <p className="mt-8 text-center font-body text-base text-muted-foreground">
          {t("interviewFeedback.thanks")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-3 max-w-[820px] mx-auto">
          <Input
            type="text"
            placeholder={t("interviewFeedback.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            required
            className="h-12"
          />
          <Input
            type="email"
            placeholder={t("interviewFeedback.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
            className="h-12"
          />
          <Textarea
            placeholder={t("interviewFeedback.messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={4000}
            required
            rows={5}
          />
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-ui text-sm"
          >
            {submitting ? t("interviewFeedback.sending") : t("interviewFeedback.submit")}
          </Button>
        </form>
      )}
    </section>
  );
};

export default InterviewFeedbackForm;
