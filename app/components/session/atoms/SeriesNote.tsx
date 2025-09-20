import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StickyNote } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export interface SeriesNoteProps {
  note: string;
}

const SeriesNote = React.memo<SeriesNoteProps>(({
  note
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  if (!note) return null;

  return (
    <View style={styles.container}>
      <StickyNote size={14} color={theme.colors.primary} />
      <Text style={styles.noteText} numberOfLines={2} ellipsizeMode="tail">
        {note}
      </Text>
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  noteText: {
    flex: 1,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm
  }
});

SeriesNote.displayName = 'SeriesNote';

export default SeriesNote;
