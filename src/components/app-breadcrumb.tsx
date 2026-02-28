"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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

  if (pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink aria-current="page">Landing</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Initialize breadcrumbs with "Home" for workspace routes
  const crumbs = [{ name: "Home", href: "/home" }];

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
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbLink aria-current="page" className="capitalize">
                    {crumb.name}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink asChild className="capitalize">
                    <Link href={crumb.href} prefetch>
                      {crumb.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
