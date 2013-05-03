# Inspired by http://sleepycoders.blogspot.se/2013/03/sharing-travis-ci-generated-files.html

if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then

  echo -e "Starting to update gh-pages\n"

  grunt build-doc
  cp -R doc $HOME/doc

  cd $HOME
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis"


  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/douglasduteil/ui-utils.git tmp-doc > /dev/null

  cd tmp-doc
  cp -Rf $HOME/doc/* .

  git add -f .
  git commit -m "Build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
  git push -fq origin gh-pages > /dev/null

  echo -e "All done.\n"
fi
