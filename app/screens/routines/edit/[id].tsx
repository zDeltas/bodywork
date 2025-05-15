import { View, Text, StyleSheet } from 'react-native';

export default function EditRoutineScreen() {
  // TODO: récupérer l'id de la routine via les params de navigation
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier la routine</Text>
      {/* Étape 1 : titre & description */}
      {/* Étape 2 : sélection des exercices */}
      {/* Étape 3 : configuration des métadonnées */}
      {/* Étape 4 (optionnel) : ordre des exercices */}
      {/* Bouton Enregistrer */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
}); 