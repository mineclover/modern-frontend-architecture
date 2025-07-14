export type AnyObject = { lang: string; size: string };
type InputArray = string[];

type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

export const crossJoin = <T extends InputArray>(
  lang: ReadOnly<T>,
  size: InputArray
): AnyObject[] => {
  const result: AnyObject[] = [];

  for (const langVal of lang as readonly string[]) {
    for (const sizeVal of size) {
      if (langVal !== undefined && sizeVal !== undefined) {
        result.push({ lang: langVal, size: sizeVal });
      }
    }
  }
  return result;
};

// test 코드
// const lang = ['en', 'de', 'cs', 'ko']
// const size = ['1024px', '768px', '1680px']
// const crossResult = crossJoin(lang, size)
// console.log(crossResult)

// readOnly 인 lang 배열 처리하기
// export const i18n = {
//   defaultLocale: 'en',
//   locales: ['en', 'de', 'cs', 'ko'],
// } as const
