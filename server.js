// Fichier : server.js
// Description : Un serveur GraphQL complet avec Apollo Server pour une application de liste de tâches.

// Étape 1 : Importer les dépendances nécessaires
// '@apollo/server' : La bibliothèque principale pour créer notre serveur GraphQL.
// 'startStandaloneServer' : Une fonction d'aide pour démarrer rapidement le serveur.
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// Étape 2 : Définir le Schéma (Schema) GraphQL
// C'est le "contrat" de notre API. Il décrit :
// - Les types de données (ex: Todo).
// - Les requêtes possibles pour lire les données (Query).
// - Les opérations possibles pour modifier les données (Mutation).
// Le '!' signifie que le champ est obligatoire (non-nul).
const typeDefs = `#graphql
  # Le type 'Todo' représente une seule tâche dans notre liste.
  type Todo {
    id: ID!
    text: String!
    completed: Boolean!
  }

  # Le type 'Query' définit toutes les façons de lire des données.
  type Query {
    # 'todos' renvoie une liste de toutes les tâches.
    todos: [Todo]
    # 'todo' renvoie une seule tâche en fonction de son ID.
    todo(id: ID!): Todo
  }

  # Le type 'Mutation' définit toutes les façons de modifier des données.
  type Mutation {
    # 'addTodo' ajoute une nouvelle tâche et la renvoie.
    addTodo(text: String!): Todo
    # 'updateTodo' met à jour le statut 'completed' d'une tâche.
    updateTodo(id: ID!, completed: Boolean!): Todo
    # 'deleteTodo' supprime une tâche et renvoie la tâche supprimée.
    deleteTodo(id: ID!): Todo
  }
`;

// Étape 3 : Notre source de données (en mémoire pour cet exemple)
// Dans une application réelle, ces données proviendraient d'une base de données (SQL, MongoDB, etc.).
let todos = [
  { id: '1', text: 'Apprendre les bases de GraphQL', completed: true },
  { id: '2', text: 'Construire mon premier serveur', completed: false },
  { id: '3', text: 'Conquérir le monde', completed: false },
];
let nextId = 4; // Pour générer de nouveaux IDs simplement

// Étape 4 : Les Résolveurs (Resolvers)
// Ce sont les fonctions qui exécutent la logique pour chaque requête et mutation définie dans notre schéma.
// La structure de l'objet 'resolvers' doit correspondre exactement à la structure de 'typeDefs'.
const resolvers = {
  // Résolveurs pour les requêtes de type 'Query'
  Query: {
    // La fonction pour la requête 'todos'
    todos: () => todos,
    // La fonction pour la requête 'todo'. 
    // Le premier argument est 'parent', le second 'args' contient les paramètres passés (ici, 'id').
    todo: (parent, args) => todos.find(todo => todo.id === args.id),
  },

  // Résolveurs pour les opérations de type 'Mutation'
  Mutation: {
    // La fonction pour la mutation 'addTodo'
    addTodo: (parent, args) => {
      const newTodo = {
        id: String(nextId++),
        text: args.text,
        completed: false,
      };
      todos.push(newTodo);
      return newTodo;
    },
    // La fonction pour la mutation 'updateTodo'
    updateTodo: (parent, args) => {
      const todo = todos.find(todo => todo.id === args.id);
      if (!todo) return null; // Si la tâche n'est pas trouvée
      todo.completed = args.completed;
      return todo;
    },
    // La fonction pour la mutation 'deleteTodo'
    deleteTodo: (parent, args) => {
      const todoIndex = todos.findIndex(todo => todo.id === args.id);
      if (todoIndex === -1) return null; // Si la tâche n'est pas trouvée
      const [deletedTodo] = todos.splice(todoIndex, 1);
      return deletedTodo;
    },
  },
};


// Étape 5 : Créer une instance du serveur Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Étape 6 : Démarrer le serveur
// La fonction 'startStandaloneServer' lance un serveur web et le rend accessible.
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Serveur prêt à l'adresse : ${url}`);
