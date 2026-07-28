# Signal Desk daily update

The public Signal Desk is a daily Lebanon reporting monitor. It collects RSS
feeds, configured public X accounts, YouTube video metadata and captions, and
the local analysis shelf. It keeps the original link and publication time,
groups closely matching headlines, maps named places, and writes a new edition
into `public/data/signal-desk/`.

An item can enter the live wire from one configured source. The source name and
link stay beside it. A source claim does not silently become the desk's own
confirmed statement.

Human reviews are recorded in `config/reviewed.yaml` against the original
publisher URL. Karim can simply ask Codex to review a named item and record the
result; nobody needs to edit that file by hand.

## Run it yourself

From the project folder:

```bash
npm run signals:check
npm run signals:update
```

The update covers the previous 36 hours. A safety gate refuses to replace the
public edition unless at least three live sources and six relevant items are
available.

## X accounts

The normal X route uses the official recent-search API. Add the token as an
environment secret named `X_BEARER_TOKEN`; do not put it in a file.

When the token is absent, the working prototype can read the dated public
profile snapshot in `config/x_snapshot.json`. That snapshot keeps the UI and
analysis path testable. It must be refreshed from posts that were actually
observed, and the source-status record identifies it as a snapshot.

## Map layers

`lebanon-boundary.geojson` and `lebanon-districts.geojson` come from
geoBoundaries. `battlefield.geojson` carries three separate dated layers:

- the Israeli-published yellow military line;
- the red Israeli-designated no-return and operations zone;
- the purple reported Israeli occupation and operational-control area.

Every battlefield layer has a date, source URL, label, and precision field.
Daily posts can add event pins. They cannot redraw territory by themselves.

## Automatic morning edition

`.github/workflows/update-signal-desk.yml` is the server-run option. Once it is
present in the published repository, it runs at 07:10 Beirut time every morning
and can also be started from the GitHub Actions page. It uses the X API secret
when one is configured.

## What the source monitor means

- `ready`: the source responded, or a dated prototype snapshot was available.
- `unavailable`: the collector could not read the source.

An unavailable source does not stop the other sources from updating.
