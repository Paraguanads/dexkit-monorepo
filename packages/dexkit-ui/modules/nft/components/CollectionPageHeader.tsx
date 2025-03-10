import { getNetworkSlugFromChainId } from "@dexkit/core/utils/blockchain";
import { FormattedMessage } from "react-intl";

import { PageHeader } from "../../../components/PageHeader";
import { useCollection } from "../hooks/collection";

interface Props {
  chainId?: number;
  address: string;
}

function CollectionPageHeader({ chainId, address }: Props) {
  const { data: collection } = useCollection(address, chainId);

  const network = getNetworkSlugFromChainId(chainId);

  return (
    <PageHeader
      breadcrumbs={[
        {
          caption: <FormattedMessage id="home" defaultMessage="Home" />,
          uri: "/",
        },
        {
          caption: (
            <FormattedMessage id="collections" defaultMessage="Collections" />
          ),
          uri: "/collections",
        },
        {
          caption: collection?.name,
          uri: `/collection/${network}/${address}`,
          active: true,
        },
      ]}
    />
  );
}

export default CollectionPageHeader;
