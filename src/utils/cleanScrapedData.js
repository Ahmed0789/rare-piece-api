export const cleanNikeSneakersData = (rawSneaker) => {
    return {
        name: rawSneaker.name,
        brand: rawSneaker.name, // helper to guess brand
        price: parseFloat(rawSneaker.price.replace(/[^0-9.]/g, '')),
        image_url: rawSneaker.image,
        product_url: rawSneaker.link,
        source_site: 'Nike',
    };
}