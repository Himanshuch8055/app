import { useState } from "react";
import useSWR, { Fetcher } from "swr";
import { useRouter } from "next/router";

import publicApiFetcher from "lib/utils/public-api-fetcher";
import getFilterQuery from "lib/utils/get-filter-query";

interface PaginatedResponse {
  readonly data: DbPRContributor[];
  readonly meta: Meta;
}

/**
 * Fetch contributors based on pull requests.
 *
 * @param intialLimit
 * @param repoIds
 * @param range
 * @returns
 */
const useContributors = (intialLimit = 10, repoIds: number[] = []) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(intialLimit);
  const { pageId, selectedFilter, range } = router.query;
  const topic = pageId as string;
  const filterQuery = getFilterQuery(selectedFilter);
  const query = new URLSearchParams(filterQuery);

  if (Number.isNaN(Number(topic))) {
    query.set("topic", topic);
  }

  if (page) {
    query.set("page", `${page}`);
  }

  if (limit) {
    query.set("limit", `${limit}`);
  }

  if (repoIds?.length > 0) {
    query.delete("topic");
    query.set("repoIds", repoIds.join(","));
  }

  if (query.get("repo")) {
    query.delete("topic");
  }

  query.set("range", `${range ?? 30}`);

  const baseEndpoint = "contributors/search";
  const endpointString = `${baseEndpoint}?${query.toString()}`;

  const { data, error, mutate } = useSWR<PaginatedResponse, Error>(
    endpointString,
    publicApiFetcher as Fetcher<PaginatedResponse, Error>
  );

  return {
    data: data?.data ?? [],
    meta: data?.meta ?? { itemCount: 0, limit: 0, page: 0, hasNextPage: false, hasPreviousPage: false, pageCount: 0 },
    isLoading: !error && !data,
    isError: !!error,
    mutate,
    page,
    setPage,
    setLimit,
  };
};

export default useContributors;
