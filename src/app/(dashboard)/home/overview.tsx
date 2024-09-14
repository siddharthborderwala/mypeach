"use client";

import { parseAsString, useQueryState } from "nuqs";
import { CurrencyDollar, TrendUp, Users } from "@phosphor-icons/react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SelectPeriod() {
	const [period, setPeriod] = useQueryState(
		"period",
		parseAsString.withDefault("today"),
	);

	return (
		<Select
			value={period ?? undefined}
			onValueChange={(value) => setPeriod(value)}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select a period" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="today">Today</SelectItem>
					<SelectItem value="yesterday">Yesterday</SelectItem>
					<SelectItem value="week">Last Week</SelectItem>
					<SelectItem value="month">Last Month</SelectItem>
					<SelectItem value="year">Last Year</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

export function Overview() {
	return (
		<div>
			<SelectPeriod />
			<div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 mt-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Revenue</CardTitle>
						<CurrencyDollar
							weight="bold"
							className="h-4 w-4 text-muted-foreground"
						/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">₹20,000</div>
						<p className="text-xs text-muted-foreground mt-1">
							+20% from last week
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sales</CardTitle>
						<TrendUp weight="bold" className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">1200</div>
						<p className="text-xs text-muted-foreground mt-1">
							+40% from last week
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Customers</CardTitle>
						<Users weight="bold" className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">214</div>
						<p className="text-xs text-muted-foreground mt-1">
							+20% since last week
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
