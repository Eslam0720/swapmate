import React from 'react';
import { EditListingModal } from './EditListingModal';
import { DeleteListingModal } from './DeleteListingModal';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { Asset } from '@/types';

interface ProfilePageModalsProps {
  editingListing: Asset | null;
  deletingListing: { id: string; title: string } | null;
  showPhotoUpload: boolean;
  profilePhotoUrl: string;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onClosePhotoUpload: () => void;
  onUpdate: () => void;
  onPhotoUpdate: (url: string) => void;
}

export const ProfilePageModals: React.FC<ProfilePageModalsProps> = ({
  editingListing,
  deletingListing,
  showPhotoUpload,
  profilePhotoUrl,
  onCloseEdit,
  onCloseDelete,
  onClosePhotoUpload,
  onUpdate,
  onPhotoUpdate
}) => {
  return (
    <>
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          isOpen={!!editingListing}
          onClose={onCloseEdit}
          onUpdate={onUpdate}
        />
      )}

      {deletingListing && (
        <DeleteListingModal
          listingId={deletingListing.id}
          listingTitle={deletingListing.title}
          isOpen={!!deletingListing}
          onClose={onCloseDelete}
          onDelete={onUpdate}
        />
      )}

      {showPhotoUpload && (
        <ProfilePhotoUpload
          isOpen={showPhotoUpload}
          onClose={onClosePhotoUpload}
          onPhotoUpdate={onPhotoUpdate}
          currentPhotoUrl={profilePhotoUrl}
        />
      )}
    </>
  );
};