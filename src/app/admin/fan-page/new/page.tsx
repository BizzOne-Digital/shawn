import { FanPostForm } from "@/components/admin/fan-post-form";
import { PageHeader } from "@/components/admin/page-header";

export default function NewFanPostPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="New Fan Page Post" description="Write a new community blog post" />
      <FanPostForm />
    </div>
  );
}
