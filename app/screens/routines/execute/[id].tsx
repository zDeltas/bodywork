import { StyleSheet, Text, View } from 'react-native';

export default function ExecuteRoutineScreen() {
  // TODO: récupérer l'id de la routine via les params de navigation
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exécution de la routine</Text>
      {/* Minuteur de repos intégré (countdown modal) */}
      {/* Progress bar / étape en cours */}
      {/* Swipe pour passer à l'exercice suivant / précédent */}
      {/* Bouton pause / terminer */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 }
}); 
