"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ImageType } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_HOURS, type BusinessHourInput } from "@/lib/services/business-hours";
import {
  businessSubmissionSchema,
  STEP_LABELS,
  STEP_SCHEMAS,
  type BusinessSubmissionForm,
} from "@/lib/validations/business";
import { cn, formatCurrency } from "@/lib/utils";
import { prepareBusinessFormPayload } from "@/lib/url-utils";
import { WebsiteUrlInput } from "@/components/forms/website-url-input";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SOCIAL_PLATFORMS = [
  { platform: "FACEBOOK" as const, label: "Facebook" },
  { platform: "INSTAGRAM" as const, label: "Instagram" },
  { platform: "TWITTER" as const, label: "Twitter / X" },
  { platform: "LINKEDIN" as const, label: "LinkedIn" },
  { platform: "TIKTOK" as const, label: "TikTok" },
  { platform: "YOUTUBE" as const, label: "YouTube" },
];

const DAY_LABELS: Record<BusinessHourInput["dayOfWeek"], string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

interface SubmissionWizardProps {
  categories: Category[];
  initialData?: Partial<BusinessSubmissionForm> & { id?: string };
  businessStatus?: string;
}

const defaultValues: BusinessSubmissionForm = {
  name: "",
  phone: "",
  publicEmail: "",
  website: "",
  categoryId: "",
  subcategoryId: "",
  suggestedCategory: "",
  shortDescription: "",
  description: "",
  services: [],
  tags: [],
  address: "",
  addressLine2: "",
  city: "",
  state: "NY",
  zipCode: "",
  locationId: "",
  socialLinks: [],
  hours: DEFAULT_HOURS,
  images: [],
};

export function SubmissionWizard({ categories, initialData, businessStatus }: SubmissionWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [businessId, setBusinessId] = useState<string | undefined>(initialData?.id);
  const [draftSaved, setDraftSaved] = useState(!!initialData?.id);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [serviceInput, setServiceInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>("");

  const methods = useForm<BusinessSubmissionForm>({
    resolver: zodResolver(businessSubmissionSchema) as never,
    defaultValues: { ...defaultValues, ...initialData },
    mode: "onChange",
  });

  const { register, watch, setValue, getValues, trigger, formState: { errors } } = methods;
  const formValues = watch();
  const selectedCategory = categories.find((c) => c.id === formValues.categoryId);

  const saveDraft = useCallback(
    async (silent = false, options?: { force?: boolean }): Promise<string | null> => {
      const data = prepareBusinessFormPayload(getValues());
      const payload = { ...data, draft: true };
      const serialized = JSON.stringify(payload);

      if (!options?.force && serialized === lastSaved.current && businessId) {
        return businessId;
      }

      setSaving(true);
      try {
        let currentId = businessId;

        async function persist(id?: string) {
          const url = id ? `/api/businesses/${id}` : "/api/businesses";
          const method = id ? "PUT" : "POST";
          return fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        let res = await persist(currentId);

        if (res.status === 404 && currentId) {
          currentId = undefined;
          res = await persist(undefined);
        }

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          if (!silent) toast.error(json.error ?? "Failed to save draft");
          if (res.status === 404) {
            setBusinessId(undefined);
            setDraftSaved(false);
            lastSaved.current = "";
          }
          return null;
        }

        const saved = await res.json();
        const id = typeof saved?.id === "string" ? saved.id.trim() : null;
        if (!id) {
          if (!silent) toast.error("Failed to save draft");
          return null;
        }

        setBusinessId(id);
        setDraftSaved(true);
        lastSaved.current = serialized;
        if (!silent) toast.success("Draft saved");
        return id;
      } catch {
        if (!silent) toast.error("Failed to save draft");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [businessId, getValues]
  );

  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (formValues.name) saveDraft(true);
    }, 3000);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [formValues, saveDraft]);

  async function validateCurrentStep(): Promise<boolean> {
    if (step >= 7) return true;
    const schema = STEP_SCHEMAS[step];
    const fields = Object.keys(schema.shape) as (keyof BusinessSubmissionForm)[];
    const valid = await trigger(fields);
    if (!valid) {
      toast.error("Please fix the errors before continuing");
    }
    return valid;
  }

  async function handleNext() {
    const valid = await validateCurrentStep();
    if (!valid) return;
    await saveDraft(true);
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleUpload(file: File, type: ImageType) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Upload failed");
        return;
      }
      const { url, publicId } = await res.json();
      const current = getValues("images") ?? [];
      const filtered = current.filter((img) => img.type !== type || type === "GALLERY");
      const newImage = {
        url,
        publicId,
        type,
        alt: getValues("name") || "Business image",
        sortOrder: filtered.length,
      };
      setValue("images", type === "GALLERY" ? [...filtered, newImage] : [...filtered, newImage]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const canSubmit =
    !businessStatus ||
    businessStatus === "DRAFT" ||
    businessStatus === "CHANGES_REQUESTED" ||
    businessStatus === "PUBLISHED";

  const submitLabel =
    businessStatus === "PUBLISHED"
      ? "Submit Updates for Review"
      : businessStatus === "CHANGES_REQUESTED"
        ? "Resubmit for Review"
        : "Submit for Review";

  const pendingReview = businessStatus === "PENDING_REVIEW";

  async function handleSubmitForReview() {
    if (!termsAccepted) {
      toast.error("Please confirm the information is accurate");
      return;
    }
    setSubmitting(true);
    setSaving(true);
    try {
      const valid = await trigger();
      if (!valid) {
        toast.error("Please complete all required fields before submitting");
        return;
      }

      const data = prepareBusinessFormPayload(getValues());
      const fullPayload = { ...data, draft: false };

      let currentId = businessId;
      let res = await fetch(
        currentId ? `/api/businesses/${currentId}` : "/api/businesses",
        {
          method: currentId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullPayload),
        }
      );

      if (res.status === 404 && currentId) {
        currentId = undefined;
        res = await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullPayload),
        });
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error ?? "Could not save your business before submitting");
        return;
      }

      const saved = await res.json();
      const submitId = typeof saved?.id === "string" ? saved.id.trim() : null;
      if (!submitId) {
        toast.error("Could not save your business before submitting");
        return;
      }

      setBusinessId(submitId);
      setDraftSaved(true);
      lastSaved.current = JSON.stringify({ ...data, draft: true });

      const submitRes = await fetch(`/api/businesses/${submitId}/submit`, { method: "POST" });
      if (!submitRes.ok) {
        const json = await submitRes.json().catch(() => ({}));
        toast.error(json.error ?? "Submission failed");
        return;
      }

      toast.success("Business submitted for review!");
      router.push(`/dashboard/businesses/${submitId}/status`);
    } catch {
      toast.error("Submission failed");
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }

  function fieldClass(fieldError?: { message?: string }) {
    return cn("mt-1", fieldError && "border-buffalo-red ring-1 ring-buffalo-red");
  }

  function addService() {
    if (!serviceInput.trim()) return;
    const current = getValues("services") ?? [];
    setValue("services", [...current, serviceInput.trim()]);
    setServiceInput("");
  }

  function addTag() {
    if (!tagInput.trim()) return;
    const current = getValues("tags") ?? [];
    if (current.length >= 10) return;
    setValue("tags", [...current, tagInput.trim()]);
    setTagInput("");
  }

  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <FormProvider {...methods}>
      <div className="min-w-0 space-y-6 overflow-x-clip">
        <div className="space-y-2">
          <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
            <span className="min-w-0 font-medium text-navy">
              Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
            </span>
            <span className="text-muted flex items-center gap-2">
              {saving && <Loader2 className="size-3 animate-spin" />}
              {saving ? "Saving..." : draftSaved ? "Draft saved" : "Unsaved"}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input id="name" {...register("name")} className={fieldClass(errors.name)} />
                  {errors.name && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" {...register("phone")} className={fieldClass(errors.phone)} />
                  {errors.phone && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="publicEmail">Public Email</Label>
                  <Input
                    id="publicEmail"
                    type="email"
                    {...register("publicEmail")}
                    className={fieldClass(errors.publicEmail)}
                  />
                  {errors.publicEmail && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.publicEmail.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <WebsiteUrlInput
                    value={formValues.website ?? ""}
                    onChange={(v) => setValue("website", v, { shouldValidate: true })}
                    className="mt-1"
                    error={!!errors.website}
                  />
                  {errors.website && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.website.message}</p>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formValues.categoryId}
                    onValueChange={(v) => {
                      setValue("categoryId", v);
                      setValue("subcategoryId", "");
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "mt-1",
                        errors.categoryId && "border-buffalo-red ring-1 ring-buffalo-red"
                      )}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.categoryId.message}</p>
                  )}
                </div>
                {selectedCategory && selectedCategory.subcategories.length > 0 && (
                  <div>
                    <Label>Subcategory</Label>
                    <Select
                      value={formValues.subcategoryId ?? ""}
                      onValueChange={(v) => setValue("subcategoryId", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.subcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="suggestedCategory">Suggested Category (if not listed)</Label>
                  <Input id="suggestedCategory" {...register("suggestedCategory")} className="mt-1" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Input id="shortDescription" {...register("shortDescription")} className="mt-1" maxLength={200} />
                  {errors.shortDescription && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.shortDescription.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea id="description" {...register("description")} className="mt-1 min-h-32" />
                  {errors.description && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.description.message}</p>
                  )}
                </div>
                <div>
                  <Label>Services</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      placeholder="Add a service"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                    />
                    <Button type="button" onClick={addService} variant="secondary">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formValues.services ?? []).map((s, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {s}
                        <button type="button" onClick={() => setValue("services", formValues.services.filter((_, j) => j !== i))}>
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Tags (max 10)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="secondary">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formValues.tags ?? []).map((t, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        {t}
                        <button type="button" onClick={() => setValue("tags", formValues.tags.filter((_, j) => j !== i))}>
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input id="address" {...register("address")} className={fieldClass(errors.address)} />
                  {errors.address && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input id="addressLine2" {...register("addressLine2")} className="mt-1" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} className={fieldClass(errors.city)} />
                    {errors.city && (
                      <p className="text-sm text-buffalo-red mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register("state")} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input id="zipCode" {...register("zipCode")} className={fieldClass(errors.zipCode)} />
                  {errors.zipCode && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted">Add your social media profiles (optional)</p>
                {SOCIAL_PLATFORMS.map(({ platform, label }) => {
                  const existing = formValues.socialLinks?.find((s) => s.platform === platform);
                  return (
                    <div key={platform}>
                      <Label htmlFor={`social-${platform}`}>{label}</Label>
                      <Input
                        id={`social-${platform}`}
                        type="text"
                        placeholder="facebook.com/yourpage"
                        defaultValue={existing?.url?.replace(/^https?:\/\//i, "") ?? ""}
                        className="mt-1"
                        onChange={(e) => {
                          const links = [...(getValues("socialLinks") ?? [])].filter(
                            (s) => s.platform !== platform
                          );
                          const raw = e.target.value.trim();
                          if (raw) {
                            const url = raw.startsWith("http") ? raw : `https://${raw}`;
                            links.push({ platform, url });
                          }
                          setValue("socialLinks", links);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                {(formValues.hours ?? DEFAULT_HOURS).map((hour: BusinessHourInput, index: number) => (
                  <div
                    key={hour.dayOfWeek}
                    className="flex flex-col gap-3 rounded-lg bg-soft-gray p-3 sm:flex-row sm:flex-wrap sm:items-center"
                  >
                    <span className="w-full text-sm font-medium sm:w-24">{DAY_LABELS[hour.dayOfWeek]}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={hour.isClosed}
                        onCheckedChange={(checked) => {
                          const hours = [...getValues("hours")];
                          hours[index] = { ...hours[index], isClosed: checked };
                          setValue("hours", hours);
                        }}
                      />
                      <span className="text-xs text-muted">Closed</span>
                    </div>
                    {!hour.isClosed && (
                      <>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={hour.is24Hours}
                            onCheckedChange={(checked) => {
                              const hours = [...getValues("hours")];
                              hours[index] = { ...hours[index], is24Hours: checked };
                              setValue("hours", hours);
                            }}
                          />
                          <span className="text-xs text-muted">24h</span>
                        </div>
                        {!hour.is24Hours && (
                          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                            <Input
                              type="time"
                              value={hour.openTime ?? ""}
                              onChange={(e) => {
                                const hours = [...getValues("hours")];
                                hours[index] = { ...hours[index], openTime: e.target.value };
                                setValue("hours", hours);
                              }}
                              className="min-w-0 flex-1 sm:w-32 sm:flex-none"
                            />
                            <span className="text-muted">to</span>
                            <Input
                              type="time"
                              value={hour.closeTime ?? ""}
                              onChange={(e) => {
                                const hours = [...getValues("hours")];
                                hours[index] = { ...hours[index], closeTime: e.target.value };
                                setValue("hours", hours);
                              }}
                              className="min-w-0 flex-1 sm:w-32 sm:flex-none"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                {(["LOGO", "COVER"] as ImageType[]).map((type) => {
                  const img = formValues.images?.find((i) => i.type === type);
                  return (
                    <div key={type}>
                      <Label>{type === "LOGO" ? "Logo" : "Cover Image"} {type === "LOGO" ? "" : "(optional)"}</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {img ? (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt={type} className="h-24 w-24 object-cover rounded-lg border" />
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 bg-buffalo-red text-white rounded-full p-1"
                              onClick={() => setValue("images", formValues.images.filter((i) => i.type !== type))}
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <label className={cn(
                            "flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-navy",
                            uploading && "opacity-50 pointer-events-none"
                          )}>
                            <ImageIcon className="size-6 text-muted" />
                            <span className="text-xs text-muted mt-1">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(file, type);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div>
                  <Label>Gallery Images</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {formValues.images?.filter((i) => i.type === "GALLERY").map((img, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="Gallery" className="h-20 w-20 object-cover rounded-lg border" />
                      </div>
                    ))}
                    <label className={cn(
                      "flex flex-col items-center justify-center h-20 w-20 border-2 border-dashed rounded-lg cursor-pointer hover:border-navy",
                      uploading && "opacity-50 pointer-events-none"
                    )}>
                      <Upload className="size-5 text-muted" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(file, "GALLERY");
                        }}
                      />
                    </label>
                  </div>
                  {errors.images && (
                    <p className="text-sm text-buffalo-red mt-1">{errors.images.message}</p>
                  )}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-6">
                <PreviewSection title="Basic Info" items={[
                  ["Name", formValues.name],
                  ["Phone", formValues.phone],
                  ["Email", formValues.publicEmail || "—"],
                  ["Website", formValues.website || "—"],
                ]} />
                <PreviewSection title="Category" items={[
                  ["Category", categories.find((c) => c.id === formValues.categoryId)?.name ?? "—"],
                  ["Subcategory", selectedCategory?.subcategories.find((s) => s.id === formValues.subcategoryId)?.name ?? "—"],
                ]} />
                <PreviewSection title="Description" items={[
                  ["Short", formValues.shortDescription],
                  ["Services", (formValues.services ?? []).join(", ") || "—"],
                  ["Tags", (formValues.tags ?? []).join(", ") || "—"],
                ]} />
                <PreviewSection title="Location" items={[
                  ["Address", `${formValues.address}${formValues.addressLine2 ? `, ${formValues.addressLine2}` : ""}`],
                  ["City", `${formValues.city}, ${formValues.state} ${formValues.zipCode}`],
                ]} />
                <PreviewSection title="Images" items={[
                  ["Total", String(formValues.images?.length ?? 0)],
                ]} />
              </div>
            )}

            {step === 8 && (
              <div className="text-center space-y-6 py-8">
                <div className="mx-auto size-16 bg-navy/10 rounded-full flex items-center justify-center">
                  <Check className="size-8 text-navy" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy">Ready to Submit?</h3>
                  <p className="text-muted mt-2 max-w-md mx-auto">
                    Your listing will be reviewed by our team. You&apos;ll receive an email once it&apos;s approved.
                  </p>
                </div>
                <div className="flex items-start gap-3 max-w-md mx-auto text-left">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted">
                    I confirm that all information provided is accurate and I have authority to list this business.
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => saveDraft(false)}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving && <Loader2 className="animate-spin" />}
              Save Draft
            </Button>

            {step < STEP_LABELS.length - 1 ? (
              <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
                Next
                <ArrowRight className="size-4" />
              </Button>
            ) : pendingReview ? (
              <Button type="button" variant="secondary" disabled className="w-full sm:w-auto">
                Awaiting Admin Review
              </Button>
            ) : canSubmit ? (
              <Button
                type="button"
                variant="accent"
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting && <Loader2 className="animate-spin" />}
                {submitLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

function PreviewSection({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div>
      <h4 className="font-medium text-navy mb-2">{title}</h4>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
