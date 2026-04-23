export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    if (!url.searchParams.has("board")) {
        return context.next();
    }
    const response = await next();
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
        return response;
    }
    const board = url.searchParams.get("board") || "";
    const ogUrl = `${url.origin}/draw-og?board=${board}`;
    return new HTMLRewriter()
        .on('meta[property="og:image"]', {
            element(element) {
                element.setAttribute("content", ogUrl);
            },
        })
        .transform(response);
}