GET /api/v0.1/coord-freqs&llng={l}&rlng={r}&dlat={d}&ulat={u}?lim={n}&inten={i}&head={h}

l - left longitude
r - right longitude
d - lower latitude
u - upper latitude

Query Strings:
lim - limit results (default 0, returns all)
inten - if 1, yield relative intensity istead of number of IPs (default 0)
head - if 1, attach header (default 0)

Return format (.json):

[
    <header?>
    [ <latitude> <longitude> <numIps or intensity> ]
    ...
]
