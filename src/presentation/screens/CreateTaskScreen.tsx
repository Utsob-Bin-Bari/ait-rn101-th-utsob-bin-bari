import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../component/Header';
import BackButton from '../component/svgs/BackButton';
import SearchButton from '../component/svgs/SearchButton';
import { colors } from '../constants/colors';
import Button from '../component/Button';

const CreateTaskScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientSection}
      >
        <View style={styles.topRightCircle} />
        <View style={styles.bottomLeftCircle} />
        
        <Header 
          title="Create A Task" 
          LeftIcon={BackButton} 
          RightIcon={SearchButton} 
          onLeftIconPress={() => navigation.goBack()} 
          onRightIconPress={() => {}} 
          color={colors.white} 
        />
      </LinearGradient>
      <View style={styles.solidSection}>
        <View style={styles.solidSectionContent}>
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Text style={styles.titleText}>Start Time</Text>
              <TextInput style={styles.timeInput} placeholder="Select Start Time" />
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.titleText}>End Time</Text>
              <TextInput style={styles.timeInput} placeholder="Select End Time" />
            </View>
          </View>
          <View style={styles.devider} />
          <View style={styles.descriptionContainer}>
            <Text style={styles.titleText}>Description</Text>
            <TextInput style={styles.descriptionInput} placeholder="Enter Description" multiline= {true}numberOfLines={3}/>
          </View>
          <View style={styles.devider} />
          <View style={styles.categoryContainer}>
            <Text style={styles.titleText}>Category</Text>
          </View>
          <Button text="Create Task" onPress={() => {}} height={60} textSize={18} borderRadius={30} />
        </View> 
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientSection: {
    flex: 0.4,
    position: 'relative',
    overflow: 'hidden',
  },
  solidSection: {
    flex: 0.60,
    backgroundColor: colors.background,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  solidSectionContent: {
    width: '90%',
  },
  timeContainer: {
    marginTop:30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText:{
    color: colors.devider,
    fontSize: 14,
    fontWeight: '400',
  },
  timeItem: {
    width: '50%',
  },
  timeInput: {
    width: '100%',
    height: 60,
    fontSize: 25,
    fontWeight: '600',
    includeFontPadding: false,
    paddingLeft:0,
  },
  descriptionContainer: {
    marginBottom:10,
    marginTop:20,
  },
  descriptionInput: {
    width: '100%',
    height: 120,
    fontSize: 18,
    fontWeight: '500',
    includeFontPadding: false,
    paddingLeft:0,
  },
  categoryContainer: {    
    marginBottom:10,
    marginTop:20,

  },
  categoryInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  topRightCircle: {
    position: 'absolute',
    top: -150,
    right: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.blobBlue,
    opacity: 0.5,
  },
  bottomLeftCircle: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.blobBlue,
    opacity: 0.5,
  },
  devider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.devider,
  }
});

export default CreateTaskScreen;