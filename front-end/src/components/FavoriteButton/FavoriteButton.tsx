import { ActionIcon, Loader, Tooltip } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

interface FavoriteButtonProps {
  isFavorite: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export function FavoriteButton({
  isFavorite,
  disabled,
  loading,
  onClick,
}: FavoriteButtonProps) {
  const label = isFavorite ? "Retirer des favoris" : "Ajouter aux favoris";

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        size="md"
        aria-label={label}
        aria-pressed={isFavorite}
        color={isFavorite ? "red" : "gray"}
        variant="transparent"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }}
        disabled={disabled || loading}
      >
        {loading ? (
          <Loader size="xs" />
        ) : isFavorite ? (
          <IconHeartFilled size="1rem" />
        ) : (
          <IconHeart size="1rem" />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
