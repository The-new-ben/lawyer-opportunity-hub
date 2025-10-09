export function uploadToSignedUrl(url: string, file: File) {
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });
}

export default uploadToSignedUrl;
