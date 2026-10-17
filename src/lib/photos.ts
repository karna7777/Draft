// Contemporary residential architecture + material-focused interiors (Unsplash,
// free to use) — no generic suburban stock. Each tile renders a generated
// architectural drawing/render underneath, so a blocked/offline photo still
// looks intentional. Swap for your own /public assets anytime.
const U = (id: string, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PHOTOS = {
  exterior: [
    U("1600585153490-76fb20a32601"), // dark slatted contemporary, dusk
    U("1600585154340-be6161a56a0c"), // dark glass house at dusk
    U("1600607688969-a5bfcd646154"), // dark timber modernist
    U("1523217582562-09d0def993a6"), // white minimalist volume
    U("1580587771525-78b9dba3b914"), // terracotta-toned modern
    U("1512917774080-9991f1c4c750"), // modern house, pool + greenery
  ],
  interior: [
    U("1616137466211-f939a420be84"), // material living room, soft light
    U("1600607687939-ce8a6c25118c"), // warm interior
    U("1586023492125-27b2c045efd7"), // minimal interior
    U("1600210492493-0946911123ea"), // living space, daylight
  ],
};
