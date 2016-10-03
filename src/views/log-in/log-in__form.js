import {Image, View, Text, TextInput, TouchableOpacity, Linking, ScrollView, ActivityIndicator} from 'react-native';
import React from 'react';
import {logo, back} from '../../components/icon/icon';
import Keystore from '../../components/keystore/keystore';
import authorizeInHub from '../../components/auth/auth__oauth';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import usage from '../../components/usage/usage';

import styles from './log-in.styles';

const noop = () => {};
const CATEGORY_NAME = 'Login form';

  export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      errorMessage: '',
      loggingIn: false,
      youTrackBackendUrl: props.auth.config.backendUrl
    };

    const config = props.auth.config;
    Keystore.getInternetCredentials(config.auth.serverUri)
      .then(({username, password}) => this.setState({username, password}), noop);

    usage.trackScreenView('Login form');
  }

  focusOnPassword() {
    this.refs.passInput.focus();
  }

  logInViaCredentials() {
    const config = this.props.auth.config;
    this.setState({loggingIn: true});

    this.props.auth.authorizeCredentials(this.state.username, this.state.password)
      .then(() => {
        return Keystore.setInternetCredentials(config.auth.serverUri, this.state.username, this.state.password)
          .catch(noop);
      })
      .then(() => {
        usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Success');
        return this.props.onLogIn();
      })
      .catch(err => {
        usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Error');
        this.setState({errorMessage: err.error_description || err.message, loggingIn: false});
      });
  }

  changeYouTrackUrl() {
    this.props.onChangeServerUrl(this.props.auth.config.backendUrl);
  }

  logInViaHub() {
    const config = this.props.auth.config;

    return authorizeInHub(config)
      .then(code => {
        this.setState({loggingIn: true});
        return this.props.auth.authorizeOAuth(code);
      })
      .then(() => {
        usage.trackEvent(CATEGORY_NAME, 'Login via browser', 'Success');
        return this.props.onLogIn();
      })
      .catch(err => {
        usage.trackEvent(CATEGORY_NAME, 'Login via browser', 'Error');
        this.setState({loggingIn: false, errorMessage: err.error_description || err.message});
      });
  }

  signUp() {
    const config = this.props.auth.config;
    Linking.openURL(`${config.auth.serverUri}/auth/register`);
  }

  loginAsGuest() {
    console.log('TODO: Not implemented');
  }


  render() {
    return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps={true}>

        <TouchableOpacity onPress={this.changeYouTrackUrl.bind(this)} style={styles.urlChangeButton}>
          <View style={styles.urlChangeWrapper}>
            <Image source={back} style={styles.urlChangeIcon}/>
            <Text style={styles.urlChangeText}>URL</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image style={styles.logoImage} source={logo}/>
        </View>

        <TouchableOpacity onPress={this.changeYouTrackUrl.bind(this)}>
          <View>
            <Text style={styles.welcome}>Login to YouTrack</Text>
            <Text style={[styles.descriptionText, {marginTop: 8}]}>{this.props.auth.config.backendUrl}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.inputsContainer}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholder="Username"
            returnKeyType="next"
            underlineColorAndroid="transparent"
            onSubmitEditing={() => this.focusOnPassword()}
            value={this.state.username}
            onChangeText={(username) => this.setState({username})}/>
          <TextInput
            ref="passInput"
            style={styles.input}
            placeholder="Password"
            returnKeyType="done"
            underlineColorAndroid="transparent"
            value={this.state.password}
            onSubmitEditing={() => this.logInViaCredentials()}
            secureTextEntry={true}
            onChangeText={(password) => this.setState({password})}/>
          {this.state.errorMessage ? <View><Text style={styles.error}>{this.state.errorMessage}</Text></View> : null}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.signin, this.state.loggingIn ? styles.signinDisabled : {}]}
                            disabled={this.state.loggingIn}
                            onPress={this.logInViaCredentials.bind(this)}>
            <Text
              style={styles.signinText}>Log in</Text>
            {this.state.loggingIn && <ActivityIndicator style={styles.loggingInIndicator}/>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkContainer} onPress={this.logInViaHub.bind(this)}>
            <Text style={styles.linkLike}>
              Log in via Browser</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkContainer} onPress={this.signUp.bind(this)}>
            <Text style={styles.linkLike}>
              Sign up</Text>
          </TouchableOpacity>

          {/*<TouchableOpacity style={styles.linkContainer} onPress={this.loginAsGuest.bind(this)}>
           <Text style={styles.linkLike}>
           Log in as guest</Text>
           </TouchableOpacity>*/}
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>You can log in with your credentials for JetBrains Account,
            Active Directory (Domain) Labs or Attlassian Jira</Text>
        </View>

        <KeyboardSpacer/>
      </ScrollView>
    );
  }
}
