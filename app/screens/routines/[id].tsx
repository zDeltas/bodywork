import { StyleSheet, Text, View } from 'react-native';

export default function RoutineDetailScreen() {
  // TODO: récupérer l'id de la routine via les params de navigation
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail de la routine</Text>
      {/* Titre, description */}
      {/* Liste des exercices */}
      {/* Boutons Modifier et Démarrer */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 }
}); 
