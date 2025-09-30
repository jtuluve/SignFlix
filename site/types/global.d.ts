// site/types/global.d.ts
declare type PageProps<
  Params extends { [key: string]: string } = {},
  SearchParams extends { [key: string]: string | string[] | undefined } = {}
> = {
  params: Params;
  searchParams: SearchParams;
};
