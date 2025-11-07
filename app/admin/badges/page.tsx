import { revalidatePath } from "next/cache";
import { listBadges, upsertBadge, deleteBadge } from "@/lib/db/repo";
import { BadgeUpsertSchema } from "@/lib/db/validators";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { assertAdmin } from "@/lib/authz/admin";

export const dynamic = "force-dynamic";

export default async function AdminBadgesPage() {
  const admin = await assertAdmin();
  if (!admin) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <Card padding="sm" className="text-sm text-red-600">
          You must be a community manager to manage badges.
        </Card>
      </div>
    );
  }

  const badges = await listBadges();

  async function createBadge(formData: FormData) {
    "use server";
    const rawData = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      rarity: formData.get("rarity"),
      description: formData.get("description"),
    };
    const parsed = BadgeUpsertSchema.safeParse(rawData);
    if (!parsed.success) {
      // TODO: Return validation errors to the UI
      console.error("Badge validation failed:", parsed.error.flatten());
      return;
    }
    await upsertBadge({
      ...parsed.data,
      description: parsed.data.description || null,
    });
    revalidatePath("/admin/badges");
  }

  async function removeBadge(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (typeof id !== "string") return;
    await deleteBadge(id);
    revalidatePath("/admin/badges");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Manage Badges</h1>
      <form action={createBadge} className="grid gap-3 md:grid-cols-2">
        <Input name="name" placeholder="Name" />
        <Input name="slug" placeholder="Slug" />
        <select name="rarity" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>
        <Textarea name="description" rows={3} placeholder="Description" className="md:col-span-2" />
        <Button type="submit" className="md:col-span-2 w-full md:w-auto">
          Save Badge
        </Button>
      </form>
      <Card padding="sm" className="space-y-3">
        {badges.map((badge) => (
          <form key={badge.id} action={removeBadge} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{badge.name}</p>
              <p className="text-xs text-slate-500">{badge.rarity}</p>
            </div>
            <input type="hidden" name="id" value={badge.id} />
            <Button type="submit" variant="ghost">
              Remove
            </Button>
          </form>
        ))}
      </Card>
    </div>
  );
}
