import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/format";
import {
  parseProposalDetails,
  type ProposalMedia,
} from "@/lib/proposal-details";

const installationCopy = {
  not_needed: "No aplica",
  included: "Incluida",
  not_included: "No incluida",
} as const;

type ProposalDetailsCardProps = {
  price: number;
  conditions: string;
  media: Array<ProposalMedia & { url: string }>;
};

export function ProposalDetailsCard({
  price,
  conditions,
  media,
}: ProposalDetailsCardProps) {
  const details = parseProposalDetails(conditions);

  return (
    <div className="grid gap-2 text-sm">
      <p>
        <span className="text-muted-foreground">Precio: </span>
        {formatMoney(price)}
      </p>
      <p>
        <span className="text-muted-foreground">Entrega: </span>
        {details.deliveryIncluded
          ? "Incluida en el precio"
          : `No incluida · ${formatMoney(details.deliveryCost ?? 0)}`}
      </p>
      <p>
        <span className="text-muted-foreground">Instalación: </span>
        {installationCopy[details.installation]}
      </p>
      <p>
        <span className="text-muted-foreground">Garantía: </span>
        {details.warrantyYears}{" "}
        {details.warrantyYears === 1 ? "año" : "años"}
      </p>
      {details.notes ? (
        <>
          <Separator className="my-1" />
          <p className="text-muted-foreground">{details.notes}</p>
        </>
      ) : null}
      {media.length > 0 ? (
        <ul className="mt-2 grid grid-cols-2 gap-2">
          {media.map((item) => (
            <li key={item.path} className="overflow-hidden rounded-lg border border-border">
              {item.type.startsWith("video/") ? (
                <video
                  className="max-h-40 w-full bg-muted object-cover"
                  controls
                  preload="metadata"
                  src={item.url}
                >
                  <track kind="captions" />
                </video>
              ) : (
                // Signed Storage URLs are temporary; a native img avoids remotePatterns.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.name}
                  className="max-h-40 w-full object-cover"
                />
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
