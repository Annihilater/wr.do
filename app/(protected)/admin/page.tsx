import { redirect } from "next/navigation";

import { getUserRecordCount } from "@/lib/dto/cloudflare-dns-record";
import { getApiKeyCallCount, getScrapeStatsByType } from "@/lib/dto/scrape";
import { getUserShortUrlCount } from "@/lib/dto/short-urls";
import { getAllUsersActiveApiKeyCount, getAllUsersCount } from "@/lib/dto/user";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { InteractiveBarChart } from "@/components/charts/interactive-bar-chart";
import { DashboardInfoCard } from "@/components/dashboard/dashboard-info-card";
import { DashboardHeader } from "@/components/dashboard/header";

import { RadialShapeChart } from "./api-key-active-chart";
import { RadialTextChart } from "./api-key-total-nums";
import { LineChartMultiple } from "./line-chart-multiple";

export const metadata = constructMetadata({
  title: "Admin – WR.DO",
  description: "Admin page for only admin management.",
});

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !user.id || user.role !== "ADMIN") redirect("/login");

  const user_count = await getAllUsersCount();
  const user_api_key_count = await getAllUsersActiveApiKeyCount();
  const record_count = await getUserRecordCount(user.id, 1, "ADMIN");
  const url_count = await getUserShortUrlCount(user.id, 1, "ADMIN");
  const api_key_call_count = await getApiKeyCallCount();
  const screenshot_stats = await getScrapeStatsByType("screenshot");
  const meta_stats = await getScrapeStatsByType("meta-info");
  const md_stats = await getScrapeStatsByType("markdown");
  const text_stats = await getScrapeStatsByType("text");

  return (
    <>
      <DashboardHeader
        heading="Admin Panel"
        text="Access only for users with ADMIN role."
      />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-3">
          <DashboardInfoCard
            userId={user.id}
            title="Users"
            count={user_count}
            link="/admin/users"
          />
          <DashboardInfoCard
            userId={user.id}
            title="DNS Records"
            count={record_count}
            link="/admin/records"
            icon="globeLock"
          />
          <DashboardInfoCard
            userId={user.id}
            title="Short URLs"
            count={url_count}
            link="/admin/urls"
            icon="link"
          />
        </div>
        <InteractiveBarChart />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RadialShapeChart totalUser={user_count} total={user_api_key_count} />
          <RadialTextChart total={api_key_call_count} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LineChartMultiple
            chartData={screenshot_stats.concat(meta_stats)}
            type1="screenshot"
            type2="meta-info"
          />
          <LineChartMultiple
            chartData={md_stats.concat(text_stats)}
            type1="markdown"
            type2="text"
          />
        </div>
      </div>
    </>
  );
}
