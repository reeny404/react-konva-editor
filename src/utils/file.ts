export class FileError extends Error {
  constructor(name: 'FileNotFound' | 'FileInvalid', message: string) {
    super(message);
    this.name = name;
  }
}

export async function loadJsonFile<T>(fileName: string): Promise<T> {
  const res = await fetch(`/mocks/${fileName}`);

  if (!res.ok) {
    throw new FileError(
      'FileNotFound',
      `필수 mock 파일이 없습니다: ${fileName}`,
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new FileError(
      'FileInvalid',
      `mock 파일 형식이 올바르지 않습니다: ${fileName}`,
    );
  }
}
