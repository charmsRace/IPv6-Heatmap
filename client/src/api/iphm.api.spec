GET /api/v0.1/coord-freqs&llng={l}&rlng={r}&dlat={d}&ulat={u}?lim(n}&inten={i}&head={h}

l - left longitude
r - right longitude
d - lower latitude
u - upper latitude

Query strings:
lim - limit results (default 0, return all)
inten - yield relative intensity istead of number of IPs (default 0)
head - attach header (default 0)

Return format:

[
    <header?>
    [ <latitude> <longitude> <numIps or intensity> ]
    ...
]
