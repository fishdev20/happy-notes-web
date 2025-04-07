"use client";

import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export default function AppBreadCrumb() {
  const pathname = usePathname();

  // Split path and filter out empty segments
  const segments = pathname.split("/").filter(Boolean);

  // Initialize breadcrumbs with "Home" for the root path
  const crumbs = [{ name: "Home", href: "/" }];

  // Add path segments as crumbs if not at the root
  if (segments.length > 0) {
    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const name = decodeURIComponent(segment.charAt(0).toUpperCase() + segment.slice(1));
      crumbs.push({ name, href });
    });
  }
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          console.log({ crumb, index });
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={isLast ? undefined : crumb.href}
                  aria-current={isLast ? "page" : undefined}
                  className="capitalize"
                >
                  {crumb.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
